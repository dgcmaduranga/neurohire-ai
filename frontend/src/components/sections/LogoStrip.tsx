"use client";

import { motion } from "framer-motion";

const logos = [
  {
    name: "Adzuna",
    icon: (
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-lg shadow-blue-100/60">
        <span className="text-2xl font-black text-[#2563EB]">A</span>
      </div>
    ),
  },
  {
    name: "JSearch",
    icon: (
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-lg shadow-blue-100/60">
        <span className="text-2xl font-black text-[#06B6D4]">JS</span>
      </div>
    ),
  },
  {
    name: "Remotive",
    icon: (
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-lg shadow-blue-100/60">
        <span className="text-2xl font-black text-[#7C3AED]">R</span>
      </div>
    ),
  },
  {
    name: "RemoteOK",
    icon: (
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-lg shadow-blue-100/60">
        <span className="text-xl font-black text-[#111827]">OK</span>
      </div>
    ),
  },
  {
    name: "LinkedIn",
    icon: (
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-lg shadow-blue-100/60">
        <span className="text-2xl font-black text-[#0A66C2]">in</span>
      </div>
    ),
  },
  {
    name: "Indeed",
    icon: (
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-lg shadow-blue-100/60">
        <span className="text-2xl font-black text-[#2557A7]">i</span>
      </div>
    ),
  },
  {
    name: "Glassdoor",
    icon: (
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-lg shadow-blue-100/60">
        <span className="text-2xl font-black text-[#00A264]">G</span>
      </div>
    ),
  },
];

export default function LogoStrip() {
  return (
    <section className="relative overflow-hidden px-4 py-16 sm:px-5">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50/30 to-white" />

      <div className="relative mx-auto max-w-7xl">
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6 text-center text-sm font-black text-slate-500"
        >
          Connect with real job opportunities from trusted career platforms
        </motion.p>

        <div className="grid grid-cols-2 gap-4 rounded-[2rem] border border-blue-100 bg-white/75 p-5 shadow-[0_25px_90px_rgba(37,99,235,0.12)] backdrop-blur-2xl sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 lg:p-6">
          {logos.map((logo, index) => (
            <motion.div
              key={logo.name}
              initial={{ opacity: 0, y: 22, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06, duration: 0.5 }}
              whileHover={{ scale: 1.06, y: -6 }}
              className="group flex min-h-24 flex-col items-center justify-center gap-3 rounded-2xl bg-white/70 px-3 py-4 text-center transition hover:shadow-xl hover:shadow-blue-100 sm:flex-row sm:text-left lg:flex-col lg:text-center"
            >
              {logo.icon}
              <span className="text-base font-black text-slate-700 transition group-hover:text-blue-600">
                {logo.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}