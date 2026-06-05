"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  AlertTriangle,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  Heart,
  Loader2,
  MapPin,
  Search,
  Sparkles,
  X,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Job = {
  source?: string;
  title?: string;
  company?: string;
  location?: string;
  country?: string;
  description?: string;
  apply_link?: string;
  employment_type?: string;
  posted_at?: string;
};

const popularRoles = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Analyst",
  "UI UX Designer",
  "Business Analyst",
  "Digital Marketing",
];

export default function JobsPage() {
  const [query, setQuery] = useState("software engineer");
  const [location, setLocation] = useState("Sri Lanka");
  const [jobType, setJobType] = useState("All");
  const [source, setSource] = useState("All");

  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function searchJobs(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setError("");

    if (!API_URL) {
      setError("Backend API URL missing. Check frontend .env file.");
      return;
    }

    if (!query.trim()) {
      setError("Please enter a job title or keyword.");
      return;
    }

    try {
      setLoading(true);

      const searchQuery = encodeURIComponent(query);
      const searchLocation = encodeURIComponent(location || "Sri Lanka");

      const response = await fetch(
        `${API_URL}/jobs/search?query=${searchQuery}&location=${searchLocation}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to search jobs.");
      }

      setJobs(data.jobs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search jobs.");
    } finally {
      setLoading(false);
    }
  }

  function toggleSave(job: Job) {
    const exists = savedJobs.some(
      (item) =>
        item.title === job.title &&
        item.company === job.company &&
        item.apply_link === job.apply_link
    );

    if (exists) {
      setSavedJobs((prev) =>
        prev.filter(
          (item) =>
            !(
              item.title === job.title &&
              item.company === job.company &&
              item.apply_link === job.apply_link
            )
        )
      );
    } else {
      setSavedJobs((prev) => [job, ...prev]);
    }
  }

  function isSaved(job: Job) {
    return savedJobs.some(
      (item) =>
        item.title === job.title &&
        item.company === job.company &&
        item.apply_link === job.apply_link
    );
  }

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const typeMatch =
        jobType === "All" ||
        (job.employment_type || "")
          .toLowerCase()
          .includes(jobType.toLowerCase());

      const sourceMatch =
        source === "All" ||
        (job.source || "").toLowerCase().includes(source.toLowerCase());

      return typeMatch && sourceMatch;
    });
  }, [jobs, jobType, source]);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 p-8 text-white shadow-2xl shadow-blue-500/25">
        <div className="flex items-center gap-3">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15">
            <Briefcase className="h-7 w-7" />
          </div>

          <div>
            <p className="text-sm font-bold text-blue-100">
              Career Discovery
            </p>
            <h1 className="text-4xl font-black">Job Discovery</h1>
          </div>
        </div>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-blue-100">
          Search real job opportunities, compare roles, save jobs and apply
          directly from one professional workspace.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <aside className="space-y-5">
          <form
            onSubmit={searchJobs}
            className="rounded-[2rem] border border-blue-100 bg-white/90 p-6 shadow-xl shadow-blue-100/50"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                <Search className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-950">
                  Search Jobs
                </h2>
                <p className="text-sm font-semibold text-slate-500">
                  Find roles by title, skill or industry.
                </p>
              </div>
            </div>

            <label className="mt-6 block">
              <span className="text-sm font-black text-slate-800">
                Job title / keyword
              </span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Software Engineer"
                className="mt-2 w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label className="mt-4 block">
              <span className="text-sm font-black text-slate-800">
                Location
              </span>
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Sri Lanka"
                className="mt-2 w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            {error && (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 px-5 py-4 text-sm font-black text-white shadow-xl shadow-blue-500/25 transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Searching Jobs...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-5 w-5" />
                  Search Jobs
                </>
              )}
            </button>
          </form>

          <div className="rounded-[2rem] border border-blue-100 bg-white/90 p-6 shadow-xl shadow-blue-100/50">
            <div className="mb-4 flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-black text-slate-950">
                Popular Searches
              </h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {popularRoles.map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    setQuery(role);
                    setTimeout(() => searchJobs(), 0);
                  }}
                  className="rounded-full bg-blue-50 px-4 py-2 text-xs font-black text-blue-700 transition hover:bg-blue-100"
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-blue-100 bg-white/90 p-6 shadow-xl shadow-blue-100/50">
            <div className="mb-4 flex items-center gap-3">
              <Filter className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-black text-slate-950">Filters</h3>
            </div>

            <label className="block">
              <span className="text-sm font-black text-slate-800">
                Job type
              </span>
              <select
                value={jobType}
                onChange={(event) => setJobType(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none"
              >
                <option>All</option>
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Internship</option>
                <option>Remote</option>
              </select>
            </label>

            <label className="mt-4 block">
              <span className="text-sm font-black text-slate-800">
                Source
              </span>
              <select
                value={source}
                onChange={(event) => setSource(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none"
              >
                <option>All</option>
                <option>Adzuna</option>
                <option>JSearch</option>
                <option>Remotive</option>
                <option>RemoteOK</option>
              </select>
            </label>
          </div>

          <div className="rounded-[2rem] border border-blue-100 bg-slate-950 p-6 text-white shadow-xl">
            <h3 className="text-lg font-black">Saved Jobs</h3>
            <p className="mt-2 text-sm font-semibold text-slate-300">
              {savedJobs.length} jobs saved in this session.
            </p>

            <div className="mt-4 space-y-3">
              {savedJobs.slice(0, 3).map((job, index) => (
                <button
                  key={`${job.title}-${index}`}
                  onClick={() => setSelectedJob(job)}
                  className="w-full rounded-2xl bg-white/10 p-3 text-left transition hover:bg-white/15"
                >
                  <p className="text-sm font-black">{job.title}</p>
                  <p className="text-xs font-semibold text-slate-300">
                    {job.company || "Unknown Company"}
                  </p>
                </button>
              ))}

              {savedJobs.length === 0 && (
                <p className="rounded-2xl bg-white/10 p-4 text-sm font-semibold text-slate-300">
                  Saved jobs will appear here.
                </p>
              )}
            </div>
          </div>
        </aside>

        <main className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Jobs Found"
              value={filteredJobs.length.toString()}
              icon={Briefcase}
            />
            <StatCard
              label="Saved Jobs"
              value={savedJobs.length.toString()}
              icon={Heart}
            />
            <StatCard
              label="Location"
              value={location || "Any"}
              icon={MapPin}
            />
          </div>

          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-xl shadow-blue-100/50"
                >
                  <div className="h-5 w-56 animate-pulse rounded-full bg-slate-100" />
                  <div className="mt-3 h-4 w-80 animate-pulse rounded-full bg-slate-100" />
                  <div className="mt-6 h-20 animate-pulse rounded-2xl bg-slate-100" />
                </div>
              ))}
            </div>
          )}

          {!loading && filteredJobs.length === 0 && (
            <div className="grid min-h-[520px] place-items-center rounded-[2rem] border border-blue-100 bg-white p-8 text-center shadow-xl shadow-blue-100/50">
              <div>
                <Briefcase className="mx-auto h-16 w-16 text-blue-600" />
                <h2 className="mt-5 text-2xl font-black text-slate-950">
                  Search for your next role
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm font-semibold leading-7 text-slate-500">
                  Enter a role and location to discover job opportunities from
                  connected job sources.
                </p>
              </div>
            </div>
          )}

          {!loading &&
            filteredJobs.map((job, index) => (
              <JobCard
                key={`${job.title}-${job.company}-${index}`}
                job={job}
                saved={isSaved(job)}
                onSave={() => toggleSave(job)}
                onOpen={() => setSelectedJob(job)}
              />
            ))}
        </main>
      </section>

      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          saved={isSaved(selectedJob)}
          onSave={() => toggleSave(selectedJob)}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: any;
}) {
  return (
    <div className="rounded-[2rem] border border-blue-100 bg-white p-5 shadow-xl shadow-blue-100/50">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">
            {label}
          </p>
          <h3 className="mt-2 text-2xl font-black text-slate-950">{value}</h3>
        </div>

        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function JobCard({
  job,
  saved,
  onSave,
  onOpen,
}: {
  job: Job;
  saved: boolean;
  onSave: () => void;
  onOpen: () => void;
}) {
  return (
    <div className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-xl shadow-blue-100/50 transition hover:-translate-y-1">
      <div className="flex flex-col justify-between gap-4 lg:flex-row">
        <div className="flex gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
            <Building2 className="h-7 w-7" />
          </div>

          <div>
            <h3 className="text-xl font-black text-slate-950">
              {job.title || "Untitled Role"}
            </h3>

            <div className="mt-2 flex flex-wrap gap-3 text-sm font-bold text-slate-500">
              <span className="inline-flex items-center">
                <Building2 className="mr-1 h-4 w-4" />
                {job.company || "Unknown Company"}
              </span>
              <span className="inline-flex items-center">
                <MapPin className="mr-1 h-4 w-4" />
                {job.location || "Remote"}
              </span>
              <span className="inline-flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                {job.posted_at || "Recently posted"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onSave}
            className={`grid h-12 w-12 place-items-center rounded-2xl ${
              saved
                ? "bg-red-50 text-red-600"
                : "bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600"
            }`}
          >
            <Heart className={`h-5 w-5 ${saved ? "fill-current" : ""}`} />
          </button>

          <button
            onClick={onOpen}
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-1"
          >
            View Details
          </button>
        </div>
      </div>

      <p className="mt-5 line-clamp-3 text-sm font-semibold leading-7 text-slate-600">
        {stripHtml(job.description || "No description available.")}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {job.source && <Tag>{job.source}</Tag>}
        {job.employment_type && <Tag>{job.employment_type}</Tag>}
        {job.country && <Tag>{job.country}</Tag>}
      </div>
    </div>
  );
}

function JobDetailsModal({
  job,
  saved,
  onSave,
  onClose,
}: {
  job: Job;
  saved: boolean;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-blue-100 p-6">
          <div>
            <p className="text-sm font-black text-blue-600">
              {job.source || "Job Source"}
            </p>
            <h2 className="mt-1 text-3xl font-black text-slate-950">
              {job.title || "Untitled Role"}
            </h2>
            <p className="mt-2 text-sm font-bold text-slate-500">
              {job.company || "Unknown Company"} • {job.location || "Remote"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-2xl bg-red-50 p-3 text-red-600 hover:bg-red-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-6">
          <div className="mb-5 flex flex-wrap gap-2">
            {job.employment_type && <Tag>{job.employment_type}</Tag>}
            {job.country && <Tag>{job.country}</Tag>}
            {job.posted_at && <Tag>{job.posted_at}</Tag>}
          </div>

          <h3 className="text-xl font-black text-slate-950">Job Description</h3>
          <p className="mt-4 whitespace-pre-wrap text-sm font-semibold leading-7 text-slate-600">
            {stripHtml(job.description || "No description available.")}
          </p>
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-blue-100 p-6">
          <button
            onClick={onSave}
            className={`inline-flex items-center rounded-2xl px-5 py-3 text-sm font-black ${
              saved
                ? "bg-red-50 text-red-600"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            <Heart className={`mr-2 h-5 w-5 ${saved ? "fill-current" : ""}`} />
            {saved ? "Saved" : "Save Job"}
          </button>

          {job.apply_link && (
            <a
              href={job.apply_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-black text-white"
            >
              <ExternalLink className="mr-2 h-5 w-5" />
              Apply Now
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function Tag({ children }: { children: string }) {
  return (
    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
      {children}
    </span>
  );
}

function stripHtml(text: string) {
  return text.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}