"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  Loader2,
  Search,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  X,
  Zap,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Job = {
  source?: string;
  title?: string;
  company?: string;
  location?: string;
  country?: string;
  description?: string;
  apply_link?: string;
  employment_type?: string;
  posted_at?: string;
};

type AtsReport = {
  ats_score: number;
  rating: string;
  target_role: string;
  score_breakdown?: Record<string, number>;
  required_skills?: string[];
  matched_role_skills?: string[];
  missing_role_skills?: string[];
  strengths?: string[];
  improvement_plan?: string[];
  recommend_jobs_allowed?: boolean;
  recommend_jobs_message?: string;
  summary?: string;
  resume_analysis?: {
    email?: string | null;
    phone?: string | null;
    links?: string[];
    skills?: string[];
    word_count?: number;
    sections?: Record<string, boolean>;
  };
};

type AnalyzeResponse = {
  status: string;
  message: string;
  file_name?: string;
  filename?: string;
  resume_text: string;
  extracted_text_preview: string;
  ats_report: AtsReport;
};

type EnhancedResumeJson = {
  full_name?: string;
  headline?: string;
  email?: string;
  phone?: string;
  location?: string;
  links?: string[];
  summary?: string;
  skills?: string[];
  experience?: {
    title?: string;
    company?: string;
    duration?: string;
    bullets?: string[];
  }[];
  education?: {
    degree?: string;
    institution?: string;
    duration?: string;
  }[];
  projects?: {
    name?: string;
    description?: string;
    technologies?: string[];
  }[];
  certifications?: string[];
};

type ImproveResponse = {
  status: string;
  message?: string;
  improved_resume?: string;
  enhanced_resume_json?: EnhancedResumeJson;
  original_score?: number;
  original_rating?: string;
  target_role?: string;
  detail?: string | Record<string, unknown>;
};

export default function ResumeAnalyzerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [improveLoading, setImproveLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState("");

  const [jobs, setJobs] = useState<Job[]>([]);
  const [showJobsModal, setShowJobsModal] = useState(false);

  const [improvedResume, setImprovedResume] = useState("");
  const [enhancedResumeJson, setEnhancedResumeJson] =
    useState<EnhancedResumeJson | null>(null);
  const [showImproveModal, setShowImproveModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const report = result?.ats_report;
  const score = report?.ats_score ?? 0;
  const isGoodScore = score >= 80;

  const comparisonItems = useMemo(() => {
    if (!report) return [];

    return [
      {
        label: "ATS Score",
        original: `${report.ats_score}/100`,
        improved: "Optimized for 80+ ATS readiness",
      },
      {
        label: "Missing Skills",
        original: report.missing_role_skills?.join(", ") || "None detected",
        improved: "Integrated into skills/summary where relevant",
      },
      {
        label: "Impact",
        original: "Limited measurable achievements",
        improved: "Stronger action words and achievement-focused bullets",
      },
      {
        label: "Structure",
        original: "Original extracted structure",
        improved: "Premium ATS-friendly sections",
      },
    ];
  }, [report]);

  const contactItems = useMemo(() => {
    const items = [
      enhancedResumeJson?.email,
      enhancedResumeJson?.phone,
      enhancedResumeJson?.location,
      ...(enhancedResumeJson?.links || []),
    ];

    return items.filter(Boolean) as string[];
  }, [enhancedResumeJson]);

  function getToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }

  function getErrorMessage(data: ImproveResponse | { detail?: unknown }) {
    if (typeof data?.detail === "string") return data.detail;
    if (typeof data?.message === "string") return data.message;
    if (data?.detail && typeof data.detail === "object") {
      return JSON.stringify(data.detail);
    }
    return "Something went wrong.";
  }

  async function handleAnalyze(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setResult(null);
    setJobs([]);
    setImprovedResume("");
    setEnhancedResumeJson(null);
    setShowImproveModal(false);

    if (!API_URL) {
      setError("Backend API URL missing. Check NEXT_PUBLIC_API_URL.");
      return;
    }

    if (!file) {
      setError("Please upload a PDF, DOCX, TXT, PNG, JPG, or JPEG resume.");
      return;
    }

    const token = getToken();

    if (!token) {
      setError("Login token missing. Please login again.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("job_description", jobDescription);

      const response = await fetch(`${API_URL}/resumes/analyze`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(data));
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Resume analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateImprovedResume() {
    if (!API_URL || !result) return;

    const token = getToken();

    if (!token) {
      setError("Login token missing. Please login again.");
      return;
    }

    if (!result.resume_text || result.resume_text.trim().length < 50) {
      setError("Resume text is missing. Analyze resume again.");
      return;
    }

    try {
      setImproveLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/resumes/improve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          resume_text: result.resume_text,
          ats_report: result.ats_report,
          target_role: result.ats_report?.target_role || "general",
        }),
      });

      const data: ImproveResponse = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(data));
      }

      if (!data.improved_resume) {
        throw new Error("Improved resume was not returned from backend.");
      }

      setImprovedResume(data.improved_resume);
      setEnhancedResumeJson(data.enhanced_resume_json || null);
      setShowImproveModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Resume improvement failed.");
    } finally {
      setImproveLoading(false);
    }
  }

  async function handleDownloadPdf() {
    if (!API_URL || !improvedResume) return;

    const token = getToken();

    if (!token) {
      setError("Login token missing. Please login again.");
      return;
    }

    try {
      setPdfLoading(true);
      setError("");

      const filename = "neurohire-improved-resume.pdf";

      const response = await fetch(`${API_URL}/resumes/improved-pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          improved_resume: improvedResume,
          filename,
        }),
      });

      if (!response.ok) {
        let message = "PDF download failed.";
        try {
          const data = await response.json();
          message = getErrorMessage(data);
        } catch {
          message = "PDF download failed.";
        }
        throw new Error(message);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF download failed.");
    } finally {
      setPdfLoading(false);
    }
  }

  async function handleRecommendJobs() {
    if (!API_URL || !result) return;

    const report = result.ats_report;

    if (report.ats_score < 80) {
      setError("Improve your resume first before viewing recommended jobs.");
      return;
    }

    try {
      setJobsLoading(true);
      setError("");

      const query = encodeURIComponent(report.target_role || "software engineer");
      const location = encodeURIComponent("Sri Lanka");

      const response = await fetch(
        `${API_URL}/jobs/search?query=${query}&location=${location}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(data));
      }

      setJobs(data.jobs || []);
      setShowJobsModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load jobs.");
    } finally {
      setJobsLoading(false);
    }
  }

  async function copyImprovedResume() {
    if (!improvedResume) return;

    await navigator.clipboard.writeText(improvedResume);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1600);
  }

  function downloadImprovedTxt() {
    const blob = new Blob([improvedResume], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "neurohire-improved-resume.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 p-6 text-white shadow-2xl shadow-blue-500/25 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15">
            <Sparkles className="h-7 w-7" />
          </div>

          <div>
            <p className="text-sm font-bold text-blue-100">
              Resume Intelligence
            </p>
            <h1 className="text-3xl font-black sm:text-4xl">
              Resume Analyzer
            </h1>
          </div>
        </div>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-blue-100">
          Upload your resume, scan ATS quality, improve weak areas, download a
          premium improved resume, and unlock matching job recommendations.
        </p>
      </section>

      {!result && !loading && (
        <section className="grid gap-6 xl:grid-cols-[480px_1fr]">
          <form
            onSubmit={handleAnalyze}
            className="rounded-[2rem] border border-blue-100 bg-white/90 p-5 shadow-xl shadow-blue-100/50 sm:p-6"
          >
            <h2 className="text-2xl font-black text-slate-950">
              Is your resume good enough?
            </h2>

            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              Upload your resume and NeuroHire AI will check ATS readiness,
              content quality, skills match, and improvement areas.
            </p>

            <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-emerald-300 bg-emerald-50/50 p-8 text-center transition hover:bg-emerald-50 sm:p-10">
              <UploadCloud className="h-12 w-12 text-emerald-600" />
              <p className="mt-4 text-sm font-black text-slate-800">
                Drop your resume here or choose a file
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                PDF, DOCX, TXT, PNG, JPG, JPEG
              </p>

              <input
                type="file"
                accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
                className="hidden"
                onChange={(event) => {
                  const selected = event.target.files?.[0];
                  if (selected) setFile(selected);
                }}
              />
            </label>

            {file && (
              <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-white px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <FileText className="h-5 w-5 shrink-0 text-blue-600" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-800">
                      {file.name}
                    </p>
                    <p className="text-xs font-semibold text-slate-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="rounded-xl bg-red-50 p-2 text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <label className="mt-5 block">
              <span className="text-sm font-black text-slate-800">
                Target Job Description
              </span>

              <textarea
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                placeholder="Optional but recommended. Paste target job description for more accurate tailoring score."
                className="mt-2 min-h-36 w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            {error && <ErrorBox message={error} />}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-5 py-4 text-sm font-black text-white shadow-xl shadow-emerald-500/25 transition hover:-translate-y-1 hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Search className="mr-2 h-5 w-5" />
              )}
              Analyze Resume
            </button>
          </form>

          <div className="hidden rounded-[2rem] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8 shadow-xl shadow-blue-100/50 xl:block">
            <div className="rounded-[2rem] bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <p className="text-sm font-black text-slate-700">
                  Resume Score
                </p>
                <ShieldCheck className="h-6 w-6 text-emerald-500" />
              </div>

              <div className="mt-6">
                <div className="h-32 rounded-t-full border-[18px] border-emerald-400 border-b-slate-100" />
                <h3 className="mt-4 text-center text-4xl font-black text-emerald-500">
                  92/100
                </h3>
              </div>

              <div className="mt-6 space-y-3 text-sm font-bold text-slate-600">
                <p>✅ ATS Parse Rate</p>
                <p>✅ Skill Match</p>
                <p>✅ Content Quality</p>
                <p>✅ Job Tailoring</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {loading && <AnalyzingView />}

      {result && report && (
        <section className="grid gap-6 xl:grid-cols-[330px_1fr]">
          <aside className="h-fit rounded-[2rem] border border-blue-100 bg-white p-6 shadow-xl shadow-blue-100/50">
            <h2 className="text-center text-2xl font-black text-slate-800">
              Your Score
            </h2>

            <div className="mt-6 text-center">
              <div
                className={`mx-auto h-32 w-32 rounded-full border-[18px] ${
                  isGoodScore
                    ? "border-emerald-400"
                    : score >= 60
                    ? "border-yellow-400"
                    : "border-red-400"
                } border-b-slate-100`}
              />
              <h3
                className={`mt-4 text-4xl font-black ${
                  isGoodScore
                    ? "text-emerald-500"
                    : score >= 60
                    ? "text-yellow-500"
                    : "text-red-500"
                }`}
              >
                {score}/100
              </h3>
              <p className="text-sm font-bold text-slate-500">
                {report.rating}
              </p>
            </div>

            <div className="mt-6 space-y-3 border-t border-blue-100 pt-5">
              <ScoreMini
                label="Content"
                value={scoreValue(report, "keyword_match")}
              />
              <ScoreMini
                label="Sections"
                value={scoreValue(report, "resume_structure")}
              />
              <ScoreMini
                label="ATS Essentials"
                value={scoreValue(report, "ats_formatting")}
              />
              <ScoreMini
                label="Skills"
                value={scoreValue(report, "skills_match")}
              />
              <ScoreMini
                label="Tailoring"
                value={scoreValue(report, "semantic_similarity_bonus")}
              />
            </div>

            <button
              onClick={() => {
                setResult(null);
                setFile(null);
                setError("");
                setImprovedResume("");
                setEnhancedResumeJson(null);
              }}
              className="mt-6 w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm font-black text-blue-600 hover:bg-blue-50"
            >
              New Upload
            </button>
          </aside>

          <main className="space-y-5">
            {error && <ErrorBox message={error} />}

            <ReportSection
              title="ATS Parse Rate"
              status="success"
              description="Your resume text was successfully extracted and parsed by the system."
              items={[
                `Detected words: ${report.resume_analysis?.word_count || 0}`,
                `Email: ${report.resume_analysis?.email || "Not detected"}`,
                `Phone: ${report.resume_analysis?.phone || "Not detected"}`,
              ]}
            />

            <ReportSection
              title="Role Fit"
              status={isGoodScore ? "success" : "warning"}
              description={`Detected target role: ${report.target_role}. This score measures how well your resume matches the expected skills and keywords for the role.`}
              items={[
                `Matched skills: ${
                  report.matched_role_skills?.join(", ") || "None"
                }`,
                `Missing skills: ${
                  report.missing_role_skills?.join(", ") || "None"
                }`,
              ]}
            />

            <ReportSection
              title="Quantify Impact"
              status={score >= 80 ? "success" : "warning"}
              description="A strong resume should show impact using outcomes, numbers, responsibilities, tools, and achievements."
              items={report.improvement_plan || []}
            />

            <ReportSection
              title="Strengths"
              status="success"
              description="These are the strongest parts detected in your resume."
              items={report.strengths || []}
            />

            <ScoreBreakdown breakdown={report.score_breakdown} />

            <div className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-xl shadow-blue-100/50">
              <h3 className="text-xl font-black text-slate-950">
                Final Recommendation
              </h3>

              <div
                className={`mt-4 rounded-2xl px-5 py-4 text-sm font-black ${
                  isGoodScore
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-yellow-50 text-yellow-700"
                }`}
              >
                {isGoodScore
                  ? "Your resume is strong enough. You can now search matching jobs."
                  : "Your resume score is below 80. Improve your resume first before applying."}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {!isGoodScore && (
                  <button
                    onClick={handleGenerateImprovedResume}
                    disabled={improveLoading}
                    className="inline-flex items-center justify-center rounded-2xl bg-purple-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-purple-500/25 transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {improveLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-5 w-5" />
                        Generate Improved Resume
                      </>
                    )}
                  </button>
                )}

                {isGoodScore && (
                  <button
                    onClick={handleRecommendJobs}
                    disabled={jobsLoading}
                    className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {jobsLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Loading Jobs...
                      </>
                    ) : (
                      <>
                        <Briefcase className="mr-2 h-5 w-5" />
                        Recommend Jobs
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </main>
        </section>
      )}

      {showImproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm sm:p-4">
          <div className="max-h-[94vh] w-full max-w-7xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
            <div className="flex flex-col gap-4 border-b border-blue-100 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black text-purple-600">
                  AI Improved Resume
                </p>
                <h2 className="text-2xl font-black text-slate-950">
                  Premium ATS-Friendly Resume Preview
                </h2>
              </div>

              <button
                onClick={() => setShowImproveModal(false)}
                className="w-fit rounded-2xl bg-red-50 p-3 text-red-600 hover:bg-red-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[72vh] overflow-y-auto bg-slate-100 p-4 sm:p-6">
              <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
                <div className="space-y-4">
                  <div className="rounded-[1.5rem] border border-blue-100 bg-white p-5 shadow-sm">
                    <h3 className="text-lg font-black text-slate-950">
                      Original vs Improved
                    </h3>

                    <div className="mt-4 space-y-3">
                      {comparisonItems.map((item) => (
                        <div
                          key={item.label}
                          className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                        >
                          <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                            {item.label}
                          </p>
                          <div className="mt-3 grid gap-3">
                            <div>
                              <p className="text-xs font-black text-red-500">
                                Original
                              </p>
                              <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                                {item.original}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-black text-emerald-600">
                                Improved
                              </p>
                              <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">
                                {item.improved}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-blue-100 bg-white p-5 shadow-sm">
                    <h3 className="text-lg font-black text-slate-950">
                      Original Resume
                    </h3>
                    <p className="mt-4 max-h-96 overflow-y-auto whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-xs leading-6 text-slate-600">
                      {result?.resume_text}
                    </p>
                  </div>
                </div>

                <div className="mx-auto w-full max-w-[850px]">
                  <div className="min-h-[1120px] rounded-[1.25rem] bg-white p-6 shadow-2xl ring-1 ring-slate-200 sm:p-10">
                    <div className="border-b border-slate-200 pb-6">
                      <h1 className="text-3xl font-black uppercase tracking-tight text-slate-950 sm:text-4xl">
                        {enhancedResumeJson?.full_name || "Improved Resume"}
                      </h1>

                      <p className="mt-2 text-lg font-bold text-blue-600">
                        {enhancedResumeJson?.headline ||
                          report?.target_role ||
                          "ATS Optimized Candidate"}
                      </p>

                      {contactItems.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {contactItems.map((item) => (
                            <span
                              key={item}
                              className="break-all rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      )}

                      <p className="mt-5 max-w-4xl text-sm leading-7 text-slate-600">
                        {enhancedResumeJson?.summary ||
                          improvedResume.split("\n").slice(0, 5).join(" ")}
                      </p>
                    </div>

                    {enhancedResumeJson?.skills &&
                      enhancedResumeJson.skills.length > 0 && (
                        <section className="mt-7">
                          <h2 className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">
                            Skills
                          </h2>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {enhancedResumeJson.skills.map((skill) => (
                              <span
                                key={skill}
                                className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </section>
                      )}

                    {enhancedResumeJson?.experience &&
                      enhancedResumeJson.experience.length > 0 && (
                        <section className="mt-8">
                          <h2 className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">
                            Experience
                          </h2>
                          <div className="mt-4 space-y-6">
                            {enhancedResumeJson.experience.map((exp, index) => (
                              <div key={`${exp.company}-${index}`}>
                                <div className="flex flex-col justify-between gap-1 sm:flex-row">
                                  <h3 className="text-lg font-black text-slate-950">
                                    {exp.title || "Experience"}
                                  </h3>
                                  <p className="text-sm font-bold text-slate-500">
                                    {exp.duration}
                                  </p>
                                </div>
                                <p className="text-sm font-bold text-blue-600">
                                  {exp.company}
                                </p>
                                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700">
                                  {exp.bullets?.map((bullet) => (
                                    <li key={bullet}>{bullet}</li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                    {enhancedResumeJson?.projects &&
                      enhancedResumeJson.projects.length > 0 && (
                        <section className="mt-8">
                          <h2 className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">
                            Projects
                          </h2>
                          <div className="mt-4 grid gap-4 md:grid-cols-2">
                            {enhancedResumeJson.projects.map((project, index) => (
                              <div
                                key={`${project.name}-${index}`}
                                className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                              >
                                <h3 className="font-black text-slate-950">
                                  {project.name}
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                  {project.description}
                                </p>
                                {project.technologies && (
                                  <p className="mt-2 text-xs font-black text-blue-600">
                                    {project.technologies.join(" • ")}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                    {enhancedResumeJson?.education &&
                      enhancedResumeJson.education.length > 0 && (
                        <section className="mt-8">
                          <h2 className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">
                            Education
                          </h2>
                          <div className="mt-4 space-y-3">
                            {enhancedResumeJson.education.map((edu, index) => (
                              <div
                                key={`${edu.degree}-${index}`}
                                className="rounded-2xl border border-slate-100 p-4"
                              >
                                <h3 className="font-black text-slate-950">
                                  {edu.degree}
                                </h3>
                                <p className="text-sm font-semibold text-slate-600">
                                  {edu.institution} {edu.duration && `• ${edu.duration}`}
                                </p>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                    {!enhancedResumeJson && (
                      <section className="mt-8">
                        <h2 className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">
                          Improved Resume
                        </h2>
                        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                          {improvedResume}
                        </p>
                      </section>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-blue-100 p-5 sm:flex-row sm:justify-end">
              <button
                onClick={copyImprovedResume}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-100 px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-200"
              >
                <Copy className="mr-2 h-5 w-5" />
                {copied ? "Copied!" : "Copy Improved Resume"}
              </button>

              <button
                onClick={downloadImprovedTxt}
                className="inline-flex items-center justify-center rounded-2xl bg-purple-100 px-5 py-3 text-sm font-black text-purple-700 hover:bg-purple-200"
              >
                <Download className="mr-2 h-5 w-5" />
                Download TXT
              </button>

              <button
                onClick={handleDownloadPdf}
                disabled={pdfLoading}
                className="inline-flex items-center justify-center rounded-2xl bg-purple-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-purple-500/25 hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {pdfLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Download className="mr-2 h-5 w-5" />
                )}
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {showJobsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[85vh] w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
            <div className="flex flex-col gap-4 border-b border-blue-100 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black text-blue-600">
                  Recommended Jobs
                </p>
                <h2 className="text-2xl font-black text-slate-950">
                  Matching jobs for {report?.target_role}
                </h2>
              </div>

              <button
                onClick={() => setShowJobsModal(false)}
                className="w-fit rounded-2xl bg-red-50 p-3 text-red-600 hover:bg-red-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[65vh] space-y-4 overflow-y-auto p-5">
              {jobs.length === 0 ? (
                <div className="rounded-2xl bg-blue-50 p-6 text-center text-sm font-bold text-slate-600">
                  No matching jobs found right now.
                </div>
              ) : (
                jobs.map((job, index) => (
                  <div
                    key={`${job.title}-${index}`}
                    className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col justify-between gap-4 md:flex-row">
                      <div>
                        <h3 className="text-lg font-black text-slate-950">
                          {job.title || "Untitled Role"}
                        </h3>
                        <p className="mt-1 text-sm font-bold text-slate-500">
                          {job.company || "Unknown Company"} •{" "}
                          {job.location || "Remote"} • {job.source}
                        </p>
                      </div>

                      {job.apply_link && (
                        <a
                          href={job.apply_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-black text-white"
                        >
                          Apply
                        </a>
                      )}
                    </div>

                    {job.description && (
                      <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-600">
                        {job.description}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AnalyzingView() {
  const steps = [
    "Parsing your resume",
    "Analyzing your experience",
    "Extracting your skills",
    "Checking ATS compatibility",
    "Generating recommendations",
  ];

  return (
    <section className="grid gap-6 xl:grid-cols-[330px_1fr]">
      <aside className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-xl shadow-blue-100/50">
        <h2 className="text-center text-2xl font-black text-slate-700">
          Your Score
        </h2>

        <div className="mx-auto mt-8 h-28 w-28 animate-pulse rounded-full border-[18px] border-slate-100 border-b-slate-200" />

        <div className="mt-8 space-y-4">
          {["Content", "Sections", "ATS Essentials", "Tailoring"].map((item) => (
            <div key={item} className="flex items-center justify-between">
              <p className="text-sm font-black text-slate-400">{item}</p>
              <div className="h-5 w-12 animate-pulse rounded-full bg-slate-100" />
            </div>
          ))}
        </div>
      </aside>

      <main className="rounded-[2rem] bg-slate-100 p-6 shadow-xl shadow-blue-100/50 sm:p-10">
        <div className="space-y-8">
          {steps.map((step) => (
            <div key={step} className="flex items-center gap-4">
              <div className="grid h-10 w-10 place-items-center rounded-full border border-purple-300 bg-white text-purple-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <p className="text-xl font-black text-slate-700 sm:text-2xl">
                {step}
              </p>
            </div>
          ))}
        </div>
      </main>
    </section>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
      {message}
    </div>
  );
}

function ScoreMini({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm font-black text-slate-600">{label}</p>
      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-black text-yellow-700">
        {value}%
      </span>
    </div>
  );
}

function scoreValue(report: AtsReport, key: string) {
  const value = report.score_breakdown?.[key] || 0;
  return Math.min(Math.round(Number(value) * 5), 100);
}

function ReportSection({
  title,
  status,
  description,
  items,
}: {
  title: string;
  status: "success" | "warning";
  description: string;
  items: string[];
}) {
  return (
    <div className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-xl shadow-blue-100/50">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-2xl font-black text-slate-950">{title}</h3>
        <CheckCircle2
          className={`h-6 w-6 shrink-0 ${
            status === "success" ? "text-emerald-500" : "text-yellow-500"
          }`}
        />
      </div>

      <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">
        {description}
      </p>

      <div className="mt-5 space-y-2">
        {items.slice(0, 8).map((item, index) => (
          <div
            key={`${title}-${index}`}
            className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
              status === "success"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-yellow-50 text-yellow-700"
            }`}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function ScoreBreakdown({ breakdown }: { breakdown?: Record<string, number> }) {
  if (!breakdown) return null;

  return (
    <div className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-xl shadow-blue-100/50">
      <h3 className="mb-4 text-xl font-black text-slate-950">
        Score Breakdown
      </h3>

      <div className="grid gap-3 md:grid-cols-2">
        {Object.entries(breakdown).map(([key, value]) => (
          <div key={key} className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-black capitalize text-slate-700">
                {key.replaceAll("_", " ")}
              </p>
              <p className="text-sm font-black text-blue-600">{value}</p>
            </div>

            <div className="mt-3 h-2 rounded-full bg-blue-100">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500"
                style={{ width: `${Math.min(Number(value) * 5, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}