"use client";

import { motion } from "framer-motion";
import {
  Briefcase,
  FileText,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import BlurText from "../ui/BlurText";
import CountUp from "../ui/CountUp";

type Stat = {
  icon: LucideIcon;
  value: number;
  suffix: string;
  label: string;
  desc: string;
};

const stats: Stat[] = [
  {
    icon: FileText,
    value: 50,
    suffix: "K+",
    label: "CVs Analyzed",
    desc: "AI-powered CV parsing",
  },
  {
    icon: Users,
    value: 10,
    suffix: "K+",
    label: "Practice Interviews",
    desc: "AI mock interview sessions",
  },
  {
    icon: Target,
    value: 95,
    suffix: "%",
    label: "CV Match Accuracy",
    desc: "Smart ATS readiness scoring",
  },
  {
    icon: Briefcase,
    value: 500,
    suffix: "+",
    label: "Job Matches",
    desc: "Personalized job discovery",
  },
];

export default function StatsSection() {
  return (
    <section className="relative overflow-hidden px-4 py-20 sm:px-5">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50/40 to-white" />
      <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/75 px-4 py-2 text-xs font-black text-blue-600 shadow-sm backdrop-blur-xl">
            <TrendingUp className="h-4 w-4" />
            Career Progress Metrics
          </div>

          <BlurText
            text="Track Your Career Readiness Growth"
            delay={0.06}
            className="justify-center text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl [&>span:nth-last-child(-n+2)]:bg-gradient-to-r [&>span:nth-last-child(-n+2)]:from-blue-600 [&>span:nth-last-child(-n+2)]:to-cyan-500 [&>span:nth-last-child(-n+2)]:bg-clip-text [&>span:nth-last-child(-n+2)]:text-transparent"
          />

          <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base">
            NeuroHire AI helps users measure CV strength, interview confidence,
            ATS readiness, and job matching progress in one intelligent dashboard.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 35 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="grid gap-5 rounded-[2.5rem] border border-blue-100 bg-white/75 p-5 shadow-[0_30px_110px_rgba(37,99,235,0.15)] backdrop-blur-2xl sm:grid-cols-2 lg:grid-cols-4 lg:p-7"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.55 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative overflow-hidden rounded-[2rem] border border-blue-100 bg-white/80 p-6 shadow-lg shadow-blue-100/50"
              >
                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 opacity-0 blur-3xl transition duration-500 group-hover:opacity-30" />

                <div className="relative mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-xl shadow-blue-500/25 transition duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <Icon className="h-7 w-7" />
                </div>

                <h3 className="relative text-4xl font-black text-slate-950 lg:text-5xl">
                  <CountUp
                    from={0}
                    to={stat.value}
                    duration={1600}
                    delay={index * 150}
                    suffix={stat.suffix}
                  />
                </h3>

                <p className="relative mt-2 text-sm font-black text-slate-700">
                  {stat.label}
                </p>

                <p className="relative mt-2 text-sm leading-6 text-slate-500">
                  {stat.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}