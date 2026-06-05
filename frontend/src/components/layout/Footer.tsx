"use client";

import Link from "next/link";
import {
  ArrowUp,
  BriefcaseBusiness,
  FileSearch,
  Mail,
  MapPin,
  MessageSquareText,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

const columns = [
  {
    title: "Career Tools",
    items: [
      "CV Analyzer",
      "ATS Readiness Score",
      "CV Improvement Tips",
      "Job Discovery",
      "Mock Interview",
      "Progress Dashboard",
    ],
  },
  {
    title: "For Users",
    items: [
      "Students",
      "Fresh Graduates",
      "Job Seekers",
      "Career Switchers",
      "Internship Seekers",
    ],
  },
  {
    title: "Platform",
    items: ["About", "Contact", "FAQ", "Privacy", "Security"],
  },
];

export default function Footer() {
  return (
    <footer id="contact" className="relative mt-12 w-full overflow-hidden">
      <div className="relative w-full rounded-t-[3.5rem] border-t border-blue-100 bg-gradient-to-b from-blue-50/80 via-white to-white px-4 pb-8 pt-10 sm:px-6 lg:px-8">
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-blue-200/50 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mx-auto grid w-full max-w-[1500px] gap-10 rounded-[2.3rem] border border-white/80 bg-white/60 p-7 shadow-[0_30px_100px_rgba(37,99,235,0.16)] backdrop-blur-2xl lg:grid-cols-[1.5fr_2fr_0.3fr] lg:p-10"
        >
          <div>
            <div className="mb-5 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-400 text-white shadow-xl shadow-blue-500/25">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-slate-950">
                  NeuroHire <span className="text-blue-600">AI</span>
                </h3>
                <p className="text-xs font-semibold text-slate-500">
                  AI Career Growth Platform
                </p>
              </div>
            </div>

            <p className="max-w-md text-base leading-8 text-slate-600">
              AI-powered career preparation platform for CV analysis, ATS
              readiness, job discovery, interview practice and personalized
              career feedback.
            </p>

            <div className="mt-6 space-y-3 text-base leading-8 text-slate-600">
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                Colombo, Sri Lanka
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-600" />
                hello@neurohire.ai
              </p>
            </div>

            <div className="mt-6 grid max-w-md gap-3 sm:grid-cols-3">
              {[
                { icon: FileSearch, label: "CV Analysis" },
                { icon: BriefcaseBusiness, label: "Job Match" },
                { icon: MessageSquareText, label: "Interview" },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-blue-100 bg-white/70 p-3 text-center shadow-sm"
                  >
                    <Icon className="mx-auto h-5 w-5 text-blue-600" />
                    <p className="mt-2 text-xs font-black text-slate-600">
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <h4 className="mb-5 text-base font-black text-slate-950">
                  {column.title}
                </h4>
                <ul className="space-y-3 text-base font-semibold text-slate-600">
                  {column.items.map((item) => (
                    <li key={item}>
                      <Link href="#" className="transition hover:text-blue-600">
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex justify-start lg:justify-end">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-xl shadow-blue-500/25 transition hover:-translate-y-1"
              aria-label="Back to top"
            >
              <ArrowUp className="h-6 w-6" />
            </button>
          </div>
        </motion.div>

        <div className="relative mx-auto mt-5 flex w-full max-w-[1500px] flex-col justify-between gap-5 rounded-3xl border border-white/80 bg-white/65 px-8 py-5 text-sm font-semibold text-slate-500 shadow-lg shadow-blue-100/40 backdrop-blur-2xl md:flex-row">
          <p>© 2026 NeuroHire AI. All rights reserved.</p>
          <div className="flex flex-wrap gap-6">
            <Link href="#" className="hover:text-blue-600">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-blue-600">
              Terms
            </Link>
            <Link href="#" className="hover:text-blue-600">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}