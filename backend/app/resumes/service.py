import json
import os
import re
from datetime import datetime
from typing import Any, Dict, List, Optional

import httpx
from dotenv import load_dotenv
from fastapi import HTTPException, UploadFile
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from app.ats.service import generate_ats_report
from app.database import ats_reports_collection, resumes_collection
from app.resumes.extractor import extract_resume_text
from app.resumes.parser import parse_resume_text

load_dotenv()

UPLOAD_DIR = "app/uploads/resumes"
PDF_DIR = "app/uploads/generated_resumes"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(PDF_DIR, exist_ok=True)


def serialize_document(document: dict):
    document["_id"] = str(document["_id"])

    if "created_at" in document:
        document["created_at"] = str(document["created_at"])

    if "updated_at" in document:
        document["updated_at"] = str(document["updated_at"])

    return document


async def save_uploaded_file(file: UploadFile, user_id: str) -> tuple[str, str]:
    allowed_extensions = [".pdf", ".docx", ".txt", ".png", ".jpg", ".jpeg"]

    original_filename = file.filename or "resume"
    extension = os.path.splitext(original_filename.lower())[1]

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Only PDF, DOCX, TXT, PNG, JPG and JPEG files are supported.",
        )

    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    safe_filename = original_filename.replace(" ", "_")
    stored_filename = f"{user_id}_{timestamp}_{safe_filename}"
    file_path = os.path.join(UPLOAD_DIR, stored_filename)

    content = await file.read()

    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    with open(file_path, "wb") as buffer:
        buffer.write(content)

    return file_path, stored_filename


async def save_and_analyze_resume(
    file: UploadFile,
    user_id: str,
    job_description: str = "",
):
    file_path, stored_filename = await save_uploaded_file(file, user_id)

    try:
        extracted_text = extract_resume_text(
            file_path,
            file.filename or stored_filename,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Resume text extraction failed: {str(e)}",
        )

    if not extracted_text or len(extracted_text.strip()) < 50:
        raise HTTPException(
            status_code=400,
            detail="Could not extract enough readable text from this resume. Please upload a clearer PDF/DOCX/TXT or high-quality image.",
        )

    parsed_resume = parse_resume_text(extracted_text)
    ats_report = generate_ats_report(extracted_text, job_description)

    resume_doc = {
        "user_id": user_id,
        "filename": file.filename,
        "stored_filename": stored_filename,
        "file_path": file_path,
        "extracted_text": extracted_text,
        "parsed_resume": parsed_resume,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    resume_result = await resumes_collection.insert_one(resume_doc)

    ats_doc = {
        "user_id": user_id,
        "resume_id": str(resume_result.inserted_id),
        "job_description": job_description,
        "report": ats_report,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    await ats_reports_collection.insert_one(ats_doc)

    return {
        "status": "success",
        "message": "Resume analyzed successfully",
        "resume_id": str(resume_result.inserted_id),
        "filename": file.filename,
        "stored_filename": stored_filename,
        "resume_text": extracted_text,
        "extracted_text_preview": extracted_text[:900],
        "parsed_resume": parsed_resume,
        "ats_report": ats_report,
    }


def build_resume_improvement_prompt(
    resume_text: str,
    ats_report: Dict[str, Any],
    target_role: str,
) -> str:
    return f"""
You are a world-class ATS resume strategist and premium resume writer.

Rewrite this resume into a professional, ATS-friendly, modern resume for:
{target_role}

Current ATS Score: {ats_report.get("ats_score")}
Current Rating: {ats_report.get("rating")}
Missing Role Skills: {ats_report.get("missing_role_skills", [])}
Improvement Plan: {ats_report.get("improvement_plan", [])}
Score Breakdown: {ats_report.get("score_breakdown", {})}

Return ONLY valid JSON. No markdown. No explanation.

JSON schema:
{{
  "personal_info": {{
    "name": "",
    "title": "",
    "email": "",
    "phone": "",
    "location": "",
    "links": []
  }},
  "summary": "",
  "skills": {{
    "technical": [],
    "professional": [],
    "tools": []
  }},
  "experience": [
    {{
      "role": "",
      "company": "",
      "location": "",
      "date": "",
      "bullets": []
    }}
  ],
  "projects": [
    {{
      "name": "",
      "description": "",
      "bullets": [],
      "link": ""
    }}
  ],
  "education": [
    {{
      "degree": "",
      "institution": "",
      "location": "",
      "date": ""
    }}
  ],
  "certifications": [],
  "languages": [],
  "achievements": [],
  "improvements_made": [],
  "estimated_new_score": 0
}}

Strict rules:
- Do NOT invent fake companies, fake degrees, fake certifications, fake job titles, fake dates, or fake awards.
- Use only information supported by the resume.
- Improve weak bullets into achievement-focused bullets.
- Use strong action verbs.
- Add measurable impact only when it is already present or can be safely phrased without fake numbers.
- Make the resume look premium, clean, and ATS-friendly.
- Use sections: Summary, Core Skills, Experience, Projects, Education, Certifications, Languages, Achievements.
- If information is missing, keep the field empty.
- Estimated new score must be realistic between current score and 95.

Original Resume:
{resume_text}
"""


def safe_json_from_text(text: str) -> Optional[Dict[str, Any]]:
    try:
        return json.loads(text)
    except Exception:
        pass

    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        return None

    try:
        return json.loads(match.group(0))
    except Exception:
        return None


def extract_name_from_text(resume_text: str) -> str:
    lines = [line.strip() for line in resume_text.splitlines() if line.strip()]

    if not lines:
        return "Candidate Name"

    first_line = lines[0]

    if len(first_line.split()) <= 6 and not any(char.isdigit() for char in first_line):
        return first_line.title()

    return "Candidate Name"


def extract_title_from_text(resume_text: str, target_role: str) -> str:
    lines = [line.strip() for line in resume_text.splitlines() if line.strip()]

    if len(lines) >= 2 and len(lines[1]) <= 120:
        return lines[1]

    return target_role.title()


def extract_sections_from_text(resume_text: str) -> Dict[str, List[str]]:
    sections = {
        "experience": [],
        "projects": [],
        "education": [],
        "certifications": [],
        "languages": [],
    }

    current = None

    for raw_line in resume_text.splitlines():
        line = raw_line.strip()
        lower = line.lower()

        if not line:
            continue

        if "experience" in lower or "employment" in lower or "work history" in lower:
            current = "experience"
            continue

        if "project" in lower:
            current = "projects"
            continue

        if "education" in lower:
            current = "education"
            continue

        if "certification" in lower or "course" in lower:
            current = "certifications"
            continue

        if "language" in lower:
            current = "languages"
            continue

        if current:
            sections[current].append(line)

    return sections


def build_local_enhanced_resume_json(
    resume_text: str,
    ats_report: Dict[str, Any],
    target_role: str,
) -> Dict[str, Any]:
    analysis = ats_report.get("resume_analysis", {}) or {}
    skills = analysis.get("skills", []) or []
    links = analysis.get("links", []) or []
    missing_skills = ats_report.get("missing_role_skills", []) or []
    improvements = ats_report.get("improvement_plan", []) or []
    sections = extract_sections_from_text(resume_text)

    supported_missing = [
        skill for skill in missing_skills if skill.lower() in resume_text.lower()
    ]

    technical_skills = list(dict.fromkeys(skills + supported_missing))[:18]

    professional_skills = [
        "Communication",
        "Problem Solving",
        "Team Collaboration",
        "Time Management",
        "Attention to Detail",
    ]

    bullets = []

    for line in resume_text.splitlines():
        clean = line.strip("•- ").strip()
        if not clean:
            continue

        if len(clean.split()) >= 5 and any(
            word in clean.lower()
            for word in [
                "developed",
                "managed",
                "improved",
                "created",
                "built",
                "designed",
                "implemented",
                "analyzed",
                "led",
                "supported",
                "coordinated",
                "optimized",
                "trained",
                "prepared",
                "handled",
                "maintained",
            ]
        ):
            bullets.append(clean)

    if not bullets:
        bullets = [
            f"Applied relevant knowledge and practical skills to support {target_role} responsibilities.",
            "Collaborated with stakeholders and team members to complete tasks efficiently.",
            "Improved workflow quality through clear communication, organization, and problem-solving.",
            "Maintained accuracy, consistency, and professionalism in assigned work.",
        ]

    current_score = float(ats_report.get("ats_score") or 0)
    estimated_new_score = min(95, max(current_score + 18, 82))

    return {
        "personal_info": {
            "name": extract_name_from_text(resume_text),
            "title": extract_title_from_text(resume_text, target_role),
            "email": analysis.get("email") or "",
            "phone": analysis.get("phone") or "",
            "location": "",
            "links": links,
        },
        "summary": (
            f"Results-driven {target_role.title()} with practical experience, strong problem-solving ability, "
            "and a commitment to delivering accurate, reliable, and user-focused outcomes. Skilled in collaborating "
            "with teams, improving workflows, and applying professional knowledge to real-world challenges."
        ),
        "skills": {
            "technical": technical_skills,
            "professional": professional_skills,
            "tools": [],
        },
        "experience": [
            {
                "role": target_role.title(),
                "company": "",
                "location": "",
                "date": "",
                "bullets": bullets[:8],
            }
        ],
        "projects": [
            {
                "name": line,
                "description": "",
                "bullets": [],
                "link": "",
            }
            for line in sections.get("projects", [])[:4]
        ],
        "education": [
            {
                "degree": line,
                "institution": "",
                "location": "",
                "date": "",
            }
            for line in sections.get("education", [])[:4]
        ],
        "certifications": sections.get("certifications", [])[:6],
        "languages": sections.get("languages", [])[:5],
        "achievements": [],
        "improvements_made": improvements[:10],
        "estimated_new_score": round(estimated_new_score, 2),
    }


def enhanced_json_to_text(data: Dict[str, Any]) -> str:
    personal = data.get("personal_info", {}) or {}
    skills = data.get("skills", {}) or {}

    lines = []

    name = personal.get("name") or "Candidate Name"
    title = personal.get("title") or "Professional"

    lines.append(name.upper())
    lines.append(title)

    contact_parts = [
        personal.get("email"),
        personal.get("phone"),
        personal.get("location"),
        *personal.get("links", []),
    ]

    contact_line = " | ".join([item for item in contact_parts if item])

    if contact_line:
        lines.append(contact_line)

    lines.append("")
    lines.append("PROFESSIONAL SUMMARY")
    lines.append(data.get("summary", ""))

    all_skills = []
    all_skills.extend(skills.get("technical", []) or [])
    all_skills.extend(skills.get("professional", []) or [])
    all_skills.extend(skills.get("tools", []) or [])

    if all_skills:
        lines.append("")
        lines.append("CORE SKILLS")
        lines.append(", ".join([skill for skill in all_skills if skill]))

    if data.get("experience"):
        lines.append("")
        lines.append("PROFESSIONAL EXPERIENCE")

        for item in data.get("experience", []):
            header = " | ".join(
                part
                for part in [
                    item.get("role"),
                    item.get("company"),
                    item.get("location"),
                    item.get("date"),
                ]
                if part
            )

            if header:
                lines.append(header)

            for bullet in item.get("bullets", []):
                lines.append(f"• {bullet}")

    if data.get("projects"):
        lines.append("")
        lines.append("PROJECTS")

        for item in data.get("projects", []):
            if item.get("name"):
                lines.append(item.get("name"))

            if item.get("description"):
                lines.append(item.get("description"))

            for bullet in item.get("bullets", []):
                lines.append(f"• {bullet}")

            if item.get("link"):
                lines.append(item.get("link"))

    if data.get("education"):
        lines.append("")
        lines.append("EDUCATION")

        for item in data.get("education", []):
            edu_line = " | ".join(
                part
                for part in [
                    item.get("degree"),
                    item.get("institution"),
                    item.get("location"),
                    item.get("date"),
                ]
                if part
            )

            if edu_line:
                lines.append(edu_line)

    if data.get("certifications"):
        lines.append("")
        lines.append("CERTIFICATIONS")
        for cert in data.get("certifications", []):
            lines.append(f"• {cert}")

    if data.get("languages"):
        lines.append("")
        lines.append("LANGUAGES")
        for lang in data.get("languages", []):
            lines.append(f"• {lang}")

    if data.get("achievements"):
        lines.append("")
        lines.append("KEY ACHIEVEMENTS")
        for item in data.get("achievements", []):
            lines.append(f"• {item}")

    return "\n".join(lines).strip()


async def generate_improved_resume(
    resume_text: str,
    ats_report: Dict[str, Any],
    target_role: str = "general",
):
    openai_key = os.getenv("OPENAI_API_KEY")

    if not resume_text or len(resume_text.strip()) < 50:
        raise HTTPException(
            status_code=400,
            detail="Resume text is too short to improve.",
        )

    enhanced_json = None
    message = "Premium ATS-friendly resume generated successfully."

    if openai_key:
        prompt = build_resume_improvement_prompt(
            resume_text=resume_text,
            ats_report=ats_report,
            target_role=target_role,
        )

        try:
            async with httpx.AsyncClient(timeout=90) as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {openai_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": "gpt-4o-mini",
                        "messages": [
                            {
                                "role": "system",
                                "content": "You are a premium ATS resume writer. Return only valid JSON.",
                            },
                            {
                                "role": "user",
                                "content": prompt,
                            },
                        ],
                        "temperature": 0.25,
                    },
                )

            data = response.json()

            if response.status_code == 200:
                content = data["choices"][0]["message"]["content"]
                enhanced_json = safe_json_from_text(content)
            else:
                print("OpenAI error:", data)
                message = "OpenAI failed. Local premium resume generated."

        except Exception as e:
            print("Resume improve error:", str(e))
            message = f"AI generation failed. Local premium resume generated. Error: {str(e)}"
    else:
        message = "Local premium resume generated because OPENAI_API_KEY is missing."

    if not enhanced_json:
        enhanced_json = build_local_enhanced_resume_json(
            resume_text=resume_text,
            ats_report=ats_report,
            target_role=target_role,
        )

    improved_resume = enhanced_json_to_text(enhanced_json)

    return {
        "status": "success",
        "message": message,
        "target_role": target_role,
        "original_score": ats_report.get("ats_score"),
        "original_rating": ats_report.get("rating"),
        "estimated_new_score": enhanced_json.get("estimated_new_score"),
        "enhanced_resume_json": enhanced_json,
        "improved_resume": improved_resume,
    }


def add_pdf_section(story, title: str, items: List[str], styles):
    if not items:
        return

    story.append(Spacer(1, 10))
    story.append(Paragraph(title, styles["SectionTitle"]))

    for item in items:
        if item:
            story.append(Paragraph(f"• {item}", styles["BulletText"]))


async def generate_improved_resume_pdf(
    improved_resume: str,
    user_id: str,
    filename: str = "neurohire-improved-resume.pdf",
):
    if not improved_resume or len(improved_resume.strip()) < 50:
        raise HTTPException(
            status_code=400,
            detail="Improved resume text is too short to generate PDF.",
        )

    safe_filename = filename.replace(" ", "_")
    if not safe_filename.lower().endswith(".pdf"):
        safe_filename += ".pdf"

    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    pdf_path = os.path.join(PDF_DIR, f"{user_id}_{timestamp}_{safe_filename}")

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        rightMargin=0.55 * inch,
        leftMargin=0.55 * inch,
        topMargin=0.45 * inch,
        bottomMargin=0.45 * inch,
    )

    base_styles = getSampleStyleSheet()

    styles = {
        "Name": ParagraphStyle(
            "Name",
            parent=base_styles["Title"],
            fontSize=22,
            leading=26,
            textColor=colors.HexColor("#0F172A"),
            alignment=TA_LEFT,
            spaceAfter=4,
        ),
        "Title": ParagraphStyle(
            "Title",
            parent=base_styles["Normal"],
            fontSize=11,
            leading=14,
            textColor=colors.HexColor("#2563EB"),
            spaceAfter=6,
        ),
        "Contact": ParagraphStyle(
            "Contact",
            parent=base_styles["Normal"],
            fontSize=8.5,
            leading=11,
            textColor=colors.HexColor("#475569"),
            spaceAfter=8,
        ),
        "SectionTitle": ParagraphStyle(
            "SectionTitle",
            parent=base_styles["Heading2"],
            fontSize=10.5,
            leading=13,
            textColor=colors.HexColor("#111827"),
            spaceBefore=8,
            spaceAfter=4,
            borderWidth=0,
        ),
        "Body": ParagraphStyle(
            "Body",
            parent=base_styles["Normal"],
            fontSize=8.7,
            leading=12,
            textColor=colors.HexColor("#334155"),
            spaceAfter=4,
        ),
        "BulletText": ParagraphStyle(
            "BulletText",
            parent=base_styles["Normal"],
            fontSize=8.4,
            leading=11.5,
            leftIndent=10,
            textColor=colors.HexColor("#334155"),
            spaceAfter=3,
        ),
    }

    lines = [line.strip() for line in improved_resume.splitlines() if line.strip()]

    name = lines[0] if len(lines) > 0 else "Candidate Name"
    title = lines[1] if len(lines) > 1 else "Professional Resume"
    contact = lines[2] if len(lines) > 2 and "|" in lines[2] else ""

    story = [
        Paragraph(name, styles["Name"]),
        Paragraph(title, styles["Title"]),
    ]

    if contact:
        story.append(Paragraph(contact, styles["Contact"]))

    section_titles = {
        "PROFESSIONAL SUMMARY",
        "CORE SKILLS",
        "PROFESSIONAL EXPERIENCE",
        "EXPERIENCE",
        "PROJECTS",
        "EDUCATION",
        "CERTIFICATIONS",
        "LANGUAGES",
        "KEY ACHIEVEMENTS",
    }

    start_index = 3 if contact else 2
    current_section = None
    section_content: Dict[str, List[str]] = {}

    for line in lines[start_index:]:
        if line.upper() in section_titles:
            current_section = line.upper()
            section_content[current_section] = []
        elif current_section:
            section_content[current_section].append(line)

    for section, items in section_content.items():
        story.append(Spacer(1, 8))
        story.append(Paragraph(section, styles["SectionTitle"]))

        for item in items:
            escaped = item.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

            if item.startswith("•") or item.startswith("-"):
                story.append(Paragraph(escaped, styles["BulletText"]))
            else:
                story.append(Paragraph(escaped, styles["Body"]))

    footer = Table(
        [["Generated by NeuroHire AI"]],
        colWidths=[7.1 * inch],
    )
    footer.setStyle(
        TableStyle(
            [
                ("ALIGN", (0, 0), (-1, -1), "RIGHT"),
                ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#94A3B8")),
                ("FONTSIZE", (0, 0), (-1, -1), 7),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )

    story.append(Spacer(1, 12))
    story.append(footer)

    doc.build(story)

    return pdf_path


async def get_resume_history(user_id: str):
    resumes = await resumes_collection.find(
        {"user_id": user_id},
        {"extracted_text": 0},
    ).sort("created_at", -1).to_list(50)

    return [serialize_document(resume) for resume in resumes]


async def get_ats_reports(user_id: str):
    reports = await ats_reports_collection.find(
        {"user_id": user_id}
    ).sort("created_at", -1).to_list(50)

    return [serialize_document(report) for report in reports]