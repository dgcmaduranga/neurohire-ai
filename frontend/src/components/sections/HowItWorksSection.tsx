"use client";

import { motion } from "framer-motion";
import {
  Bot,
  BriefcaseBusiness,
  CheckCircle,
  FileUp,
  MessageSquare,
  Target,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import BlurText from "../ui/BlurText";

type Step = {
  icon: LucideIcon;
  title: string;
  desc: string;
  color: string;
};

const steps: Step[] = [
  {
    icon: FileUp,
    title: "Upload CV",
    desc: "Users upload their CV in PDF, DOCX, or scanned format to begin career analysis.",
    color: "from-blue-600 to-cyan-500",
  },
  {
    icon: Bot,
    title: "AI CV Analysis",
    desc: "OCR and NLP extract skills, education, experience, projects, and career strengths.",
    color: "from-cyan-500 to-blue-600",
  },
  {
    icon: Target,
    title: "ATS Score",
    desc: "The system checks CV readiness and shows missing skills, keywords, and weak areas.",
    color: "from-indigo-600 to-blue-500",
  },
  {
    icon: BriefcaseBusiness,
    title: "Job Matching",
    desc: "Users discover suitable job opportunities based on their CV, skills, and career goals.",
    color: "from-violet-600 to-indigo-500",
  },
  {
    icon: MessageSquare,
    title: "Interview Practice",
    desc: "Users practice mock interviews and receive AI feedback to improve confidence.",
    color: "from-sky-500 to-cyan-500",
  },
];

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden px-4 py-20 sm:px-5 lg:py-28"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50/40 to-white" />
      <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-cyan-200/40 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <div className="mb-4 inline-flex rounded-full border border-blue-100 bg-white/75 px-4 py-2 text-xs font-black text-blue-600 shadow-sm backdrop-blur-xl">
            Workflow
          </div>

          <BlurText
            text="How NeuroHire AI Works"
            delay={0.06}
            className="justify-center text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl [&>span:nth-last-child(-n+2)]:bg-gradient-to-r [&>span:nth-last-child(-n+2)]:from-blue-600 [&>span:nth-last-child(-n+2)]:to-cyan-500 [&>span:nth-last-child(-n+2)]:bg-clip-text [&>span:nth-last-child(-n+2)]:text-transparent"
          />

          <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base">
            A simple career preparation workflow from CV upload to AI-powered
            job matching, ATS improvement, and interview practice.
          </p>
        </div>

        <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          <div className="absolute left-0 right-0 top-[4.5rem] hidden h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent lg:block" />

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 40, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative rounded-[2rem] border border-blue-100 bg-white/75 p-6 text-center shadow-[0_24px_80px_rgba(37,99,235,0.12)] backdrop-blur-2xl"
              >
                <div
                  className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${step.color} opacity-0 blur-3xl transition duration-500 group-hover:opacity-35`}
                />

                <div
                  className={`relative z-10 mx-auto mb-6 grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br ${step.color} text-white shadow-xl shadow-blue-500/20 transition duration-500 group-hover:scale-110 group-hover:rotate-3`}
                >
                  <Icon className="h-9 w-9" />
                </div>

                <p className="mb-2 text-sm font-black text-blue-600">
                  Step 0{index + 1}
                </p>

                <h3 className="text-xl font-black text-slate-950">
                  {step.title}
                </h3>

                <p className="mx-auto mt-3 max-w-xs text-sm leading-7 text-slate-600">
                  {step.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}