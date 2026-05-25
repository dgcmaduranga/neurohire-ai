"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bot,
  BriefcaseBusiness,
  FileSearch,
  Sparkles,
  Target,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import BlurText from "../ui/BlurText";

type Tool = {
  name: string;
  desc: string;
  icon: LucideIcon;
  items: string[];
  button: string;
  popular?: boolean;
};

const tools: Tool[] = [
  {
    name: "CV Analyzer",
    desc: "Understand your CV strength",
    icon: FileSearch,
    items: [
      "OCR-based CV reading",
      "Skill and keyword extraction",
      "ATS readiness score",
      "Improvement suggestions",
    ],
    button: "Analyze CV",
  },
  {
    name: "Job Match",
    desc: "Find roles that fit your profile",
    icon: BriefcaseBusiness,
    items: [
      "Real job discovery",
      "Skill-based job matching",
      "Missing skill detection",
      "Personalized recommendations",
    ],
    button: "Explore Jobs",
    popular: true,
  },
  {
    name: "Interview Coach",
    desc: "Practice before real interviews",
    icon: Bot,
    items: [
      "Role-based questions",
      "Mock interview practice",
      "Answer score and feedback",
      "Confidence improvement",
    ],
    button: "Practice Now",
  },
];

export default function PricingSection() {
  return (
    <section
      id="career-tools"
      className="relative overflow-hidden px-4 py-16 sm:px-5 lg:py-20"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50/40 to-white" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-4 py-2 text-xs font-black text-blue-600 shadow-sm">
            <Sparkles className="h-4 w-4" />
            Career Tools
          </div>

          <BlurText
            text="Everything You Need to Become Job Ready"
            delay={0.06}
            className="justify-center text-4xl font-black tracking-tight text-slate-950 sm:text-5xl [&>span:nth-last-child(-n+2)]:bg-gradient-to-r [&>span:nth-last-child(-n+2)]:from-blue-600 [&>span:nth-last-child(-n+2)]:to-cyan-500 [&>span:nth-last-child(-n+2)]:bg-clip-text [&>span:nth-last-child(-n+2)]:text-transparent"
          />

          <p className="mt-4 text-sm leading-7 text-slate-600">
            Use AI-powered tools to analyze your CV, match with suitable jobs,
            and practice interviews before applying.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {tools.map((tool, index) => {
            const Icon = tool.icon;

            return (
              <motion.div
                key={tool.name}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ y: -8 }}
                className={`relative rounded-[1.7rem] border bg-white/80 p-6 shadow-[0_20px_70px_rgba(37,99,235,0.12)] backdrop-blur-2xl ${
                  tool.popular ? "border-blue-500" : "border-blue-100"
                }`}
              >
                {tool.popular && (
                  <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                    Recommended
                  </div>
                )}

                <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20">
                  <Icon className="h-5 w-5" />
                </div>

                <h3 className="text-2xl font-black text-slate-950">
                  {tool.name}
                </h3>

                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {tool.desc}
                </p>

                <ul className="my-6 space-y-3">
                  {tool.items.map((item) => (
                    <li
                      key={item}
                      className="flex gap-2 text-sm font-semibold text-slate-600"
                    >
                      <Target className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                      {item}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  className={`group flex items-center justify-center rounded-2xl px-5 py-3.5 text-center text-sm font-black transition ${
                    tool.popular
                      ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-xl shadow-blue-500/25"
                      : "border border-blue-100 bg-white text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  {tool.button}
                  <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {[
            {
              icon: BarChart3,
              title: "Career Progress Dashboard",
              desc: "Track your CV score, job match percentage, interview performance, and readiness growth over time.",
            },
            {
              icon: Sparkles,
              title: "Personalized AI Guidance",
              desc: "Receive smart suggestions based on your skills, CV gaps, target roles, and interview practice history.",
            },
          ].map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + index * 0.08 }}
                className="rounded-[1.7rem] border border-blue-100 bg-white/75 p-6 shadow-[0_20px_70px_rgba(37,99,235,0.1)] backdrop-blur-2xl"
              >
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                  <Icon className="h-5 w-5" />
                </div>

                <h3 className="text-xl font-black text-slate-950">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}