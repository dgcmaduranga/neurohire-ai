"use client";

import Link from "next/link";
import { Menu, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const links = [
  { name: "Home", href: "#home" },
  { name: "Platform", href: "#features" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "Pricing", href: "#pricing" },
  { name: "Resources", href: "#resources" },
  { name: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -35, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="fixed left-0 top-0 z-50 w-full px-4 py-5"
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-[28px] border border-white/50 bg-white/55 px-5 py-3 shadow-[0_24px_80px_rgba(37,99,235,0.16)] backdrop-blur-2xl">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-400 text-white shadow-xl shadow-blue-500/30">
            <Sparkles className="h-6 w-6" />
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-cyan-300 shadow-lg shadow-cyan-300" />
          </div>

          <div>
            <p className="text-xl font-black tracking-tight text-slate-950">
              NeuroHire <span className="text-blue-600">AI</span>
            </p>
            <p className="text-[11px] font-semibold tracking-wide text-slate-500">
              Intelligent Hiring Cloud
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-1 rounded-2xl border border-white/50 bg-white/45 p-1 text-sm font-bold text-slate-700 shadow-inner lg:flex">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="rounded-xl px-4 py-2.5 transition hover:bg-blue-600 hover:text-white"
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/login"
            className="rounded-2xl border border-blue-100 bg-white/60 px-5 py-3 text-sm font-black text-slate-900 shadow-sm backdrop-blur-xl transition hover:border-blue-300 hover:bg-white"
          >
            Log in
          </Link>

          <Link
            href="/book-demo"
            className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 px-6 py-3 text-sm font-black text-white shadow-xl shadow-blue-600/30 transition hover:scale-[1.03]"
          >
            Book a Demo →
          </Link>
        </div>

        <button
          className="grid h-11 w-11 place-items-center rounded-2xl border border-blue-100 bg-white/70 text-slate-900 lg:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </nav>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-3 rounded-3xl border border-white/50 bg-white/80 p-5 shadow-2xl backdrop-blur-2xl lg:hidden"
        >
          <div className="flex flex-col gap-3 text-sm font-black text-slate-800">
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 hover:bg-blue-50"
              >
                {link.name}
              </Link>
            ))}

            <Link href="/login" className="rounded-xl border border-blue-100 px-4 py-3 text-center">
              Log in
            </Link>
            <Link href="/book-demo" className="rounded-xl bg-blue-600 px-4 py-3 text-center text-white">
              Book a Demo
            </Link>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}