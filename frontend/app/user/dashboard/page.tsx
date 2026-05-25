"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bell,
  Bot,
  FileText,
  LayoutDashboard,
  LogOut,
  Target,
  UploadCloud,
  User,
} from "lucide-react";

const cards = [
  { title: "Upload CV", desc: "Upload PDF/DOC resume for AI analysis.", icon: UploadCloud },
  { title: "ATS Score", desc: "Check resume match percentage.", icon: Target },
  { title: "AI Resume Feedback", desc: "Improve keywords and formatting.", icon: FileText },
  { title: "AI Mock Interview", desc: "Practice role-based interviews.", icon: Bot },
];

export default function UserDashboardPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-blue-50/60 to-cyan-50 p-5">
      <div className="mx-auto max-w-7xl">
        <nav className="mb-8 flex flex-col justify-between gap-4 rounded-[2rem] border border-white/80 bg-white/70 p-5 shadow-xl shadow-blue-100/60 backdrop-blur-2xl md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
              <LayoutDashboard />
            </span>
            <div>
              <h1 className="text-2xl font-black text-slate-950">User Dashboard</h1>
              <p className="text-sm font-semibold text-slate-500">Welcome back to NeuroHire AI</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="grid h-11 w-11 place-items-center rounded-xl border border-blue-100 bg-white text-blue-600">
              <Bell className="h-5 w-5" />
            </button>
            <Link href="/" className="flex items-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Link>
          </div>
        </nav>

        <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[2rem] border border-white/80 bg-white/70 p-8 shadow-[0_30px_100px_rgba(37,99,235,0.16)] backdrop-blur-2xl"
            >
              <h2 className="text-4xl font-black text-slate-950">
                Start with your resume analysis
              </h2>
              <p className="mt-3 max-w-2xl text-slate-600">
                Upload your CV and NeuroHire AI will extract skills, calculate ATS score,
                and provide improvement suggestions.
              </p>

              <div className="mt-8 rounded-[2rem] border-2 border-dashed border-blue-200 bg-blue-50/60 p-10 text-center">
                <UploadCloud className="mx-auto h-14 w-14 text-blue-600" />
                <h3 className="mt-4 text-2xl font-black text-slate-950">Drag & drop your CV</h3>
                <p className="mt-2 text-sm font-semibold text-slate-500">
                  PDF, DOC, DOCX supported
                </p>
                <button className="mt-6 rounded-2xl bg-blue-600 px-7 py-4 font-black text-white shadow-xl shadow-blue-500/25">
                  Upload Resume
                </button>
              </div>
            </motion.div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {cards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 35 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="rounded-[2rem] border border-white/80 bg-white/70 p-6 shadow-xl shadow-blue-100/60 backdrop-blur-2xl"
                  >
                    <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                      <Icon />
                    </div>
                    <h3 className="text-xl font-black text-slate-950">{card.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{card.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <aside className="rounded-[2rem] border border-white/80 bg-white/70 p-6 shadow-xl shadow-blue-100/60 backdrop-blur-2xl">
            <div className="text-center">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-blue-50 text-blue-600">
                <User className="h-9 w-9" />
              </div>
              <h3 className="mt-4 text-xl font-black text-slate-950">Charith Gamage</h3>
              <p className="text-sm font-semibold text-slate-500">Candidate Account</p>
            </div>

            <div className="mt-8 space-y-4">
              {[
                ["Resume Score", "86%"],
                ["Interviews", "03"],
                ["Saved Reports", "12"],
                ["Notifications", "05"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between rounded-2xl bg-blue-50/70 p-4">
                  <span className="font-bold text-slate-600">{label}</span>
                  <span className="font-black text-blue-600">{value}</span>
                </div>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}