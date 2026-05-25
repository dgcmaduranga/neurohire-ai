"use client";

import Link from "next/link";
import { ArrowRight, Calendar, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import BlurText from "../ui/BlurText";

export default function CTASection() {
  return (
    <section className="relative overflow-hidden px-4 py-20 sm:px-5">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50/40 to-white" />
      <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="absolute bottom-0 right-10 h-80 w-80 rounded-full bg-cyan-200/50 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 45, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-blue-100 bg-white/70 p-8 shadow-[0_35px_120px_rgba(37,99,235,0.18)] backdrop-blur-2xl sm:p-10 lg:p-14"
      >
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-400/20 blur-2xl" />

        <div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-4 py-2 text-xs font-black text-blue-600 shadow-sm">
              <Sparkles className="h-4 w-4" />
              Ready to grow your career?
            </div>

            <BlurText
              text="Build your career confidence with NeuroHire AI."
              delay={0.06}
              className="max-w-3xl text-3xl font-black leading-tight text-slate-950 sm:text-4xl lg:text-5xl [&>span:nth-last-child(-n+3)]:bg-gradient-to-r [&>span:nth-last-child(-n+3)]:from-blue-600 [&>span:nth-last-child(-n+3)]:to-cyan-500 [&>span:nth-last-child(-n+3)]:bg-clip-text [&>span:nth-last-child(-n+3)]:text-transparent"
            />

            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Upload your CV, analyze your ATS readiness, discover matching job
              opportunities, and practice interviews with personalized AI feedback.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row lg:justify-end">
            <Link
              href="/signup"
              className="group inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 px-7 py-4 text-sm font-black text-white shadow-xl shadow-blue-500/30 transition hover:-translate-y-1"
            >
              Start Career Check
              <ArrowRight className="ml-2 h-5 w-5 transition group-hover:translate-x-1" />
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-2xl border border-blue-100 bg-white/75 px-7 py-4 text-sm font-black text-slate-950 shadow-lg shadow-blue-100/70 backdrop-blur-2xl transition hover:-translate-y-1 hover:bg-white"
            >
              <Calendar className="mr-2 h-5 w-5 text-blue-600" />
              Practice Interview
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}