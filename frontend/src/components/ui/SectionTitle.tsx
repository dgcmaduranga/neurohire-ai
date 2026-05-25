"use client";

import { motion } from "framer-motion";

type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
};

export default function SectionTitle({ eyebrow, title, subtitle }: SectionTitleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.65 }}
      className="mx-auto mb-14 max-w-3xl text-center"
    >
      {eyebrow && (
        <p className="mb-3 text-sm font-black uppercase tracking-[0.22em] text-blue-600">
          {eyebrow}
        </p>
      )}
      <h2 className="text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-5 text-base leading-8 text-slate-600 md:text-lg">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}