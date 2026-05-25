"use client";

import { motion } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import BlurText from "../ui/BlurText";

const faqs = [
  {
    question: "What is NeuroHire AI?",
    answer:
      "NeuroHire AI is an AI career preparation platform that helps users analyze their CV, improve ATS readiness, find matching jobs, and practice interviews.",
  },
  {
    question: "How does the ATS score work?",
    answer:
      "The system compares your CV with job requirements by checking skills, keywords, education, experience, and project relevance.",
  },
  {
    question: "Can I improve my CV using NeuroHire AI?",
    answer:
      "Yes. The platform identifies missing skills, weak keywords, formatting issues, and gives suggestions to improve your CV quality.",
  },
  {
    question: "Does it show real job opportunities?",
    answer:
      "Yes. It can show matching job opportunities using external job APIs such as Adzuna, JSearch, Remotive, and RemoteOK.",
  },
  {
    question: "Can I practice mock interviews?",
    answer:
      "Yes. You can practice role-based mock interviews and receive AI feedback for answer quality, confidence, and communication.",
  },
  {
    question: "Is my CV data secure?",
    answer:
      "Yes. User accounts, uploaded CVs, and analysis results are protected using secure authentication and private user workflows.",
  },
];

export default function FAQSection() {
  return (
    <section
      id="faq"
      className="relative overflow-hidden px-4 py-16 sm:px-5 lg:py-20"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50/40 to-white" />

      <div className="relative mx-auto max-w-5xl">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-4 py-2 text-xs font-black text-blue-600 shadow-sm">
            <HelpCircle className="h-4 w-4" />
            FAQ
          </div>

          <BlurText
            text="Frequently Asked Questions"
            delay={0.06}
            className="justify-center text-4xl font-black tracking-tight text-slate-950 sm:text-5xl [&>span:nth-last-child(-n+1)]:bg-gradient-to-r [&>span:nth-last-child(-n+1)]:from-blue-600 [&>span:nth-last-child(-n+1)]:to-cyan-500 [&>span:nth-last-child(-n+1)]:bg-clip-text [&>span:nth-last-child(-n+1)]:text-transparent"
          />

          <p className="mt-4 text-sm leading-7 text-slate-600">
            Quick answers about CV analysis, ATS scoring, job discovery,
            interview practice, and data security.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.details
              key={faq.question}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className="group rounded-2xl border border-blue-100 bg-white/80 p-5 shadow-lg shadow-blue-100/50 backdrop-blur-2xl open:bg-white"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-black text-slate-950">
                {faq.question}
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600 transition group-open:rotate-180">
                  <ChevronDown className="h-5 w-5" />
                </span>
              </summary>

              <p className="mt-4 border-t border-blue-50 pt-4 text-sm leading-7 text-slate-600">
                {faq.answer}
              </p>
            </motion.details>
          ))}
        </div>
      </div>
    </section>
  );
}