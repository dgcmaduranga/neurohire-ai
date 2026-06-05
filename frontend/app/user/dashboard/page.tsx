"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Briefcase,
  CheckCircle2,
  FileText,
  Loader2,
  Mic,
  RefreshCcw,
  Sparkles,
  Target,
  TrendingUp,
  User,
  Zap,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type DashboardStats = {
  profile_completion?: number;
  total_resumes?: number;
  total_interviews?: number;
  average_ats_score?: number;
  best_ats_score?: number;
  resumes_this_week?: number;
  interviews_this_week?: number;
};

type LatestResume = {
  file_name?: string;
  ats_score?: number;
  rating?: string;
  target_role?: string;
  created_at?: string | null;
};

type LatestInterview = {
  score?: number;
  role?: string;
  status?: string;
  created_at?: string | null;
};

type DashboardSummary = {
  user?: {
    id?: string;
    _id?: string;
    name?: string;
    username?: string;
    email?: string;
    phone?: string;
    target_role?: string;
    location?: string;
    bio?: string;
  };
  stats?: DashboardStats;
  latest_resume?: LatestResume;
  latest_interview?: LatestInterview;
  recommended_next_step?: string;
};

type DashboardResponse = {
  status?: string;
  summary?: DashboardSummary;
  detail?: string | Record<string, unknown>;
  message?: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  function getErrorMessage(data: DashboardResponse) {
    if (typeof data?.detail === "string") return data.detail;
    if (typeof data?.message === "string") return data.message;
    if (data?.detail && typeof data.detail === "object") {
      return JSON.stringify(data.detail);
    }
    return "Something went wrong.";
  }

  const fetchDashboardSummary = useCallback(
    async (silent = false) => {
      setError("");

      if (!API_URL) {
        setError("Backend API URL missing. Check NEXT_PUBLIC_API_URL.");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response = await fetch(`${API_URL}/dashboard/summary`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
          cache: "no-store",
        });

        const data: DashboardResponse = await response.json();

        if (!response.ok) {
          throw new Error(getErrorMessage(data));
        }

        setSummary(data.summary || null);

        if (data.summary?.user) {
          localStorage.setItem("user", JSON.stringify(data.summary.user));
          window.dispatchEvent(new Event("user-updated"));
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard data."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [router]
  );

  useEffect(() => {
    const googleToken = searchParams.get("token");

    if (googleToken) {
      localStorage.setItem("token", googleToken);
      router.replace("/user/dashboard");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    fetchDashboardSummary(false);
  }, [router, searchParams, fetchDashboardSummary]);

  if (loading) {
    return (
      <div className="grid min-h-[70vh] place-items-center">
        <div className="rounded-[2rem] border border-blue-100 bg-white p-8 text-center shadow-xl shadow-blue-100/50">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-600" />
          <h2 className="mt-4 text-xl font-black text-slate-950">
            Loading dashboard...
          </h2>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            Preparing your career workspace.
          </p>
        </div>
      </div>
    );
  }

  const stats = summary?.stats || {};
  const latestResume = summary?.latest_resume;
  const latestInterview = summary?.latest_interview;

  const statCards = [
    {
      label: "Best ATS Score",
      value: `${stats.best_ats_score || 0}%`,
      icon: Target,
      desc: "Highest resume score",
    },
    {
      label: "Uploaded Resumes",
      value: String(stats.total_resumes || 0).padStart(2, "0"),
      icon: FileText,
      desc: `${stats.resumes_this_week || 0} uploaded this week`,
    },
    {
      label: "Profile Completion",
      value: `${stats.profile_completion || 0}%`,
      icon: User,
      desc: "Profile readiness",
    },
    {
      label: "AI Interviews",
      value: String(stats.total_interviews || 0).padStart(2, "0"),
      icon: Mic,
      desc: `${stats.interviews_this_week || 0} practiced this week`,
    },
  ];

  const actions = [
    {
      title: "Analyze Resume",
      desc: "Upload your CV and get an ATS score with improvement tips.",
      href: "/user/dashboard/resume-analyzer",
      icon: FileText,
    },
    {
      title: "Find Jobs",
      desc: "Search matching jobs based on your target role.",
      href: "/user/dashboard/jobs",
      icon: Briefcase,
    },
    {
      title: "Practice Interview",
      desc: "Start AI-powered mock interview practice.",
      href: "/user/dashboard/interview",
      icon: Mic,
    },
  ];

  return (
    <div className="space-y-8">
      {error && (
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            {error}
          </div>

          <button
            onClick={() => fetchDashboardSummary(true)}
            className="rounded-xl bg-white px-3 py-2 text-xs font-black text-red-600"
          >
            Retry
          </button>
        </div>
      )}

      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 p-6 text-white shadow-2xl shadow-blue-500/25 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold text-blue-100">Career Overview</p>

            <h1 className="mt-2 text-3xl font-black sm:text-4xl">
              Your Career Progress
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100">
              Track your resume performance, ATS readiness, interview practice,
              and AI-powered career preparation progress.
            </p>
          </div>

          <div className="rounded-[2rem] bg-white/15 p-5 backdrop-blur-md lg:w-72">
            <p className="text-xs font-black uppercase tracking-widest text-blue-100">
              Recommended Next Step
            </p>

            <p className="mt-3 text-lg font-black leading-7 text-white">
              {summary?.recommended_next_step || "Complete your profile"}
            </p>

            <Link
              href="/user/dashboard/resume-analyzer"
              className="mt-5 inline-flex items-center rounded-2xl bg-white px-4 py-3 text-sm font-black text-blue-600 transition hover:-translate-y-1"
            >
              Continue
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-[2rem] border border-blue-100 bg-white/80 p-6 shadow-xl shadow-blue-100/50 backdrop-blur-xl"
            >
              <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
                <Icon className="h-7 w-7" />
              </div>

              <h3 className="text-3xl font-black text-slate-950">
                {stat.value}
              </h3>

              <p className="mt-2 text-sm font-bold text-slate-500">
                {stat.label}
              </p>

              <p className="mt-1 text-xs font-semibold text-slate-400">
                {stat.desc}
              </p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {actions.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.title}
              href={item.href}
              className="group rounded-[2rem] border border-blue-100 bg-white/80 p-6 shadow-xl shadow-blue-100/50 transition hover:-translate-y-2"
            >
              <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                <Icon className="h-7 w-7" />
              </div>

              <h3 className="text-xl font-black text-slate-950">
                {item.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {item.desc}
              </p>

              <div className="mt-5 inline-flex items-center text-sm font-black text-blue-600">
                Open Tool
                <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-blue-100 bg-white/80 p-6 shadow-xl shadow-blue-100/50">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-black text-slate-950">
                Recent Activity
              </h2>
            </div>

            <button
              onClick={() => fetchDashboardSummary(true)}
              disabled={refreshing}
              className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {refreshing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <RefreshCcw className="h-5 w-5" />
              )}
            </button>
          </div>

          <div className="space-y-3">
            <ActivityItem
              active={Boolean(latestResume?.created_at)}
              text={
                latestResume?.created_at
                  ? `Latest resume analyzed: ${
                      latestResume.file_name || "Resume"
                    } with ${latestResume.ats_score || 0}% ATS score.`
                  : "No resume analysis yet. Upload your first resume."
              }
            />

            <ActivityItem
              active={Boolean(latestInterview?.created_at)}
              text={
                latestInterview?.created_at
                  ? `Latest interview practice completed for ${
                      latestInterview.role || "your target role"
                    } with ${latestInterview.score || 0}% score.`
                  : "No interview practice yet. Start your first mock interview."
              }
            />

            <ActivityItem
              active={(stats.profile_completion || 0) >= 80}
              text={`Profile completion is ${stats.profile_completion || 0}%.`}
            />
          </div>
        </div>

        <div className="rounded-[2rem] border border-blue-100 bg-white/80 p-6 shadow-xl shadow-blue-100/50">
          <div className="mb-5 flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-black text-slate-950">
              Performance Summary
            </h2>
          </div>

          <div className="space-y-4">
            <ProgressBar
              label="Profile Completion"
              value={stats.profile_completion || 0}
            />

            <ProgressBar
              label="Average ATS Score"
              value={stats.average_ats_score || 0}
            />

            <ProgressBar
              label="Best ATS Score"
              value={stats.best_ats_score || 0}
            />
          </div>

          <div className="mt-6 rounded-3xl bg-gradient-to-br from-blue-50 to-cyan-50 p-5">
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-blue-600" />
              <p className="text-sm font-black text-slate-950">
                AI Career Tip
              </p>
            </div>

            <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">
              {summary?.recommended_next_step ||
                "Complete your profile and analyze your resume to get smarter recommendations."}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function ActivityItem({
  text,
  active,
}: {
  text: string;
  active: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3">
      <div
        className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${
          active
            ? "bg-emerald-100 text-emerald-600"
            : "bg-yellow-100 text-yellow-600"
        }`}
      >
        {active ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
      </div>

      <p className="text-sm font-semibold leading-6 text-slate-600">{text}</p>
    </div>
  );
}

function ProgressBar({ label, value }: { label: string; value: number }) {
  const safeValue = Math.max(0, Math.min(value, 100));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-black text-slate-700">{label}</p>
        <p className="text-sm font-black text-blue-600">{safeValue}%</p>
      </div>

      <div className="h-3 rounded-full bg-blue-100">
        <div
          className="h-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}