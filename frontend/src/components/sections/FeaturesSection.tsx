"use client";

import { motion } from "framer-motion";
import {
  Bell,
  Bot,
  BrainCircuit,
  BriefcaseBusiness,
  FileText,
  LineChart,
  MessageSquareText,
  ShieldCheck,
  Target,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import BlurText from "../ui/BlurText";

type Feature = {
  icon: LucideIcon;
  title: string;
  desc: string;
  accent: string;
};

const features: Feature[] = [
  {
    icon: FileText,
    title: "AI CV Parser",
    desc: "Extract skills, education, projects, certifications and experience from your CV using OCR and NLP.",
    accent: "from-blue-600 to-cyan-500",
  },
  {
    icon: Target,
    title: "ATS Readiness Score",
    desc: "Analyze how well your CV matches job requirements and identify weak areas to improve.",
    accent: "from-indigo-600 to-blue-500",
  },
  {
    icon: BriefcaseBusiness,
    title: "Job Discovery",
    desc: "Find matching job opportunities based on your skills, experience, career goals and CV profile.",
    accent: "from-cyan-500 to-blue-600",
  },
  {
    icon: MessageSquareText,
    title: "CV Improvement Tips",
    desc: "Get suggestions for missing keywords, weak sections, formatting issues and skill gaps.",
    accent: "from-violet-600 to-blue-500",
  },
  {
    icon: Bot,
    title: "AI Mock Interview",
    desc: "Practice role-based interview questions and receive AI feedback on your answers.",
    accent: "from-blue-600 to-sky-400",
  },
  {
    icon: LineChart,
    title: "Progress Dashboard",
    desc: "Track CV scores, interview practice results, job matches and career readiness progress.",
    accent: "from-cyan-500 to-indigo-600",
  },
  {
    icon: BrainCircuit,
    title: "Personalized AI Guidance",
    desc: "Receive career preparation guidance based on your profile, skills and interview performance.",
    accent: "from-blue-500 to-violet-600",
  },
  {
    icon: ShieldCheck,
    title: "Secure User Profile",
    desc: "Keep your CV, analysis reports, interview history and personal career data protected.",
    accent: "from-sky-500 to-blue-700",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="relative overflow-hidden px-4 py-20 sm:px-5 lg:py-28">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50/50 to-white" />
      <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="absolute -right-32 bottom-10 h-96 w-96 rounded-full bg-cyan-200/50 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <div className="mb-4 inline-flex rounded-full border border-blue-100 bg-white/75 px-4 py-2 text-xs font-black text-blue-600 shadow-sm backdrop-blur-xl">
            Platform Features
          </div>

          <BlurText
            text="Powerful Features for Career Growth"
            delay={0.06}
            className="justify-center text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl [&>span:nth-last-child(-n+2)]:bg-gradient-to-r [&>span:nth-last-child(-n+2)]:from-blue-600 [&>span:nth-last-child(-n+2)]:to-cyan-500 [&>span:nth-last-child(-n+2)]:bg-clip-text [&>span:nth-last-child(-n+2)]:text-transparent"
          />

          <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base">
            A complete AI career preparation workflow with CV analysis, ATS
            readiness, job discovery, mock interview practice, feedback and
            progress tracking.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 45, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ delay: index * 0.07, duration: 0.6, ease: "easeOut" }}
                whileHover={{ y: -12, scale: 1.02 }}
                className="group relative overflow-hidden rounded-[2rem] border border-blue-100 bg-white/75 p-6 shadow-[0_24px_80px_rgba(37,99,235,0.12)] backdrop-blur-2xl"
              >
                <div className={`absolute -right-14 -top-14 h-36 w-36 rounded-full bg-gradient-to-br ${feature.accent} opacity-0 blur-3xl transition duration-500 group-hover:opacity-35`} />

                <div className={`mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br ${feature.accent} text-white shadow-xl shadow-blue-500/20 transition duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                  <Icon className="h-7 w-7" />
                </div>

                <h3 className="mb-3 text-xl font-black text-slate-950">
                  {feature.title}
                </h3>

                <p className="text-sm leading-7 text-slate-600">
                  {feature.desc}
                </p>

                <div className="mt-6 h-1.5 w-16 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-500 group-hover:w-28" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}