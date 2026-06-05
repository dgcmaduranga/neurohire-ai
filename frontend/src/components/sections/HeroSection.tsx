"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Target,
  UploadCloud,
  Zap,
} from "lucide-react";
import CardSwap, { Card } from "../ui/CardSwap";
import BlurText from "../ui/BlurText";
import CountUp from "../ui/CountUp";

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-copy", {
        y: 45,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: "power3.out",
      });

      gsap.from(".hero-right", {
        y: 60,
        opacity: 0,
        scale: 0.94,
        duration: 1.1,
        ease: "power3.out",
      });

      gsap.to(".hero-orb", {
        y: -18,
        scale: 1.04,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="home"
      ref={heroRef}
      className="relative overflow-hidden px-4 pb-16 pt-28 sm:px-5 sm:pb-20 sm:pt-36 lg:pb-24 lg:pt-44"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(37,99,235,0.16),transparent_30%),radial-gradient(circle_at_82%_22%,rgba(6,182,212,0.20),transparent_32%),linear-gradient(180deg,#ffffff_0%,#f8fbff_55%,#ffffff_100%)]" />

      <div className="hero-orb absolute -left-40 top-28 h-80 w-80 rounded-full bg-blue-200/50 blur-3xl sm:h-96 sm:w-96" />
      <div className="hero-orb absolute -right-40 top-24 h-80 w-80 rounded-full bg-cyan-200/50 blur-3xl sm:h-96 sm:w-96" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
        <div className="text-center lg:text-left">
          <div className="hero-copy mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/75 px-4 py-2 text-xs font-black text-blue-600 shadow-lg shadow-blue-100/70 backdrop-blur-2xl sm:mb-6 sm:text-sm">
            <Sparkles className="h-4 w-4" />
            AI Career Growth Platform
          </div>

          <BlurText
            text="Build your career edge with intelligent AI coaching"
            delay={0.07}
            className="mx-auto max-w-3xl text-3xl font-black leading-[1.08] tracking-tight text-slate-950 sm:text-4xl md:text-5xl lg:mx-0 lg:text-6xl [&>span:nth-last-child(-n+3)]:bg-gradient-to-r [&>span:nth-last-child(-n+3)]:from-blue-600 [&>span:nth-last-child(-n+3)]:via-indigo-600 [&>span:nth-last-child(-n+3)]:to-cyan-500 [&>span:nth-last-child(-n+3)]:bg-clip-text [&>span:nth-last-child(-n+3)]:text-transparent"
          />

          <p className="hero-copy mx-auto mt-6 max-w-2xl text-sm leading-7 text-slate-600 sm:mt-7 sm:text-base sm:leading-8 md:text-lg lg:mx-0">
            NeuroHire AI helps users analyze their CV, improve ATS readiness,
            discover matching job opportunities, and prepare for interviews with
            personalized AI feedback.
          </p>

          <div className="hero-copy mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4 lg:justify-start">
            <Link
              href="/signup"
              className="group inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 px-6 py-4 text-sm font-black text-white shadow-xl shadow-blue-500/30 transition hover:-translate-y-1 sm:px-7"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5 transition group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="hero-copy mt-8 grid grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-3">
            {[
              [95, "%", "CV match accuracy"],
              [10, "K+", "Practice interviews"],
              [50, "K+", "CVs analyzed"],
            ].map(([value, suffix, label], index) => (
              <div
                key={String(label)}
                className="rounded-2xl border border-blue-100 bg-white/70 p-4 text-left shadow-sm backdrop-blur-xl"
              >
                <p className="text-2xl font-black text-slate-950 sm:text-3xl">
                  <CountUp
                    from={0}
                    to={Number(value)}
                    duration={1600}
                    delay={index * 150}
                    suffix={String(suffix)}
                  />
                </p>
                <p className="text-sm font-semibold text-slate-500">
                  {String(label)}
                </p>
              </div>
            ))}
          </div>

          <div className="hero-copy mt-6 flex flex-wrap justify-center gap-3 text-sm font-bold text-slate-500 sm:mt-7 lg:justify-start">
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              Secure profile
            </span>
            <span className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-cyan-600" />
              Fast CV analysis
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-indigo-600" />
              Clear AI feedback
            </span>
          </div>
        </div>

        <div className="hero-right relative mx-auto min-h-[430px] w-full max-w-[560px] sm:min-h-[530px] md:min-h-[600px] lg:min-h-[640px] lg:max-w-none">
          <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-blue-100/70 via-white to-cyan-100/80 blur-2xl sm:rounded-[4rem]" />

          <div className="relative h-[430px] sm:h-[530px] md:h-[600px] lg:h-[640px]">
            <CardSwap
              width={520}
              height={400}
              cardDistance={55}
              verticalDistance={58}
              delay={3600}
              pauseOnHover={false}
              skewAmount={2}
            >
              <Card>
                <div className="h-full p-5 sm:p-7">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-black text-blue-600 sm:text-sm">
                        Step 01
                      </p>
                      <h3 className="text-2xl font-black text-slate-950 sm:text-3xl">
                        Upload CV
                      </h3>
                    </div>
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-blue-600 text-white sm:h-14 sm:w-14">
                      <UploadCloud className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="rounded-3xl border-2 border-dashed border-blue-200 bg-blue-50/70 p-6 text-center sm:p-8">
                    <UploadCloud className="mx-auto h-10 w-10 text-blue-600 sm:h-12 sm:w-12" />
                    <p className="mt-4 text-lg font-black text-slate-950 sm:text-xl">
                      Drop your CV
                    </p>
                    <p className="mt-2 text-xs font-semibold text-slate-500 sm:text-sm">
                      PDF, DOCX, scanned CV supported
                    </p>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
                    {["PDF", "DOCX", "OCR"].map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl bg-white p-3 text-center text-xs font-black text-blue-600 shadow-sm sm:p-4 sm:text-sm"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <Card>
                <div className="h-full p-5 sm:p-7">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-black text-cyan-600 sm:text-sm">
                        Step 02
                      </p>
                      <h3 className="text-2xl font-black text-slate-950 sm:text-3xl">
                        AI CV Analysis
                      </h3>
                    </div>
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cyan-500 text-white sm:h-14 sm:w-14">
                      <Bot className="h-6 w-6" />
                    </div>
                  </div>

                  {[
                    ["Skills extracted", 92],
                    ["Experience matched", 84],
                    ["Education verified", 78],
                    ["Projects analyzed", 88],
                  ].map(([label, score]) => (
                    <div key={label} className="mb-4 sm:mb-5">
                      <div className="mb-2 flex justify-between text-xs font-black text-slate-700 sm:text-sm">
                        <span>{label}</span>
                        <span>{score}%</span>
                      </div>
                      <div className="h-3 rounded-full bg-blue-50">
                        <div
                          className="h-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-400"
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <div className="h-full p-5 sm:p-7">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-black text-indigo-600 sm:text-sm">
                        Step 03
                      </p>
                      <h3 className="text-2xl font-black text-slate-950 sm:text-3xl">
                        ATS Score
                      </h3>
                    </div>
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-indigo-600 text-white sm:h-14 sm:w-14">
                      <Target className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="mx-auto grid h-36 w-36 place-items-center rounded-full bg-[conic-gradient(#2563eb_0deg_342deg,#eaf2ff_342deg_360deg)] p-4 sm:h-44 sm:w-44 sm:p-5">
                    <div className="grid h-full w-full place-items-center rounded-full bg-white text-4xl font-black text-slate-950 sm:text-5xl">
                      95%
                    </div>
                  </div>

                  <div className="mt-6 rounded-3xl bg-blue-50/70 p-4 sm:mt-7 sm:p-5">
                    <p className="text-base font-black text-slate-950 sm:text-lg">
                      Improve your CV for better job matches
                    </p>
                    <p className="mt-2 text-xs font-semibold text-slate-500 sm:text-sm">
                      Get missing skills, keyword gaps, and resume improvement tips.
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="h-full p-5 sm:p-7">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-black text-violet-600 sm:text-sm">
                        Step 04
                      </p>
                      <h3 className="text-2xl font-black text-slate-950 sm:text-3xl">
                        Mock Interview
                      </h3>
                    </div>
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-violet-600 text-white sm:h-14 sm:w-14">
                      <MessageSquareText className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="rounded-3xl border border-violet-100 bg-violet-50/70 p-5 sm:p-6">
                    <p className="text-xs font-black text-violet-600 sm:text-sm">
                      Practice Question
                    </p>
                    <h4 className="mt-3 text-base font-black text-slate-950 sm:text-xl">
                      Tell me about yourself and explain your strongest project.
                    </h4>
                    <p className="mt-4 text-xs font-semibold leading-6 text-slate-500 sm:text-sm sm:leading-7">
                      AI evaluates answer quality, confidence, communication,
                      and job readiness.
                    </p>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white p-3 shadow-sm sm:p-4">
                      <p className="text-xs font-bold text-slate-500 sm:text-sm">
                        Answer Score
                      </p>
                      <p className="text-2xl font-black text-violet-600 sm:text-3xl">
                        88%
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white p-3 shadow-sm sm:p-4">
                      <p className="text-xs font-bold text-slate-500 sm:text-sm">
                        Feedback
                      </p>
                      <p className="text-base font-black text-slate-950 sm:text-lg">
                        Strong
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </CardSwap>
          </div>
        </div>
      </div>
    </section>
  );
}