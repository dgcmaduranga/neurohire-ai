"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
  Zap,
} from "lucide-react";
import BorderGlow from "../../src/components/ui/BorderGlow";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.1 0 9.8-1.9 13.3-5.1l-6.2-5.2C29.1 35.2 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.2 5.2C36.8 39.2 44 34 44 24c0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  );
}

const benefits = [
  {
    icon: BarChart3,
    title: "Resume Intelligence",
    text: "Analyze CVs, detect skill gaps and improve ATS readiness.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Career Workspace",
    text: "Protected user account, resume history and personal insights.",
  },
  {
    icon: Zap,
    title: "Interview Practice",
    text: "Practice AI mock interviews and receive instant feedback.",
  },
];

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!agree) {
      setError("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Signup failed. Please try again.");
      }

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      router.push(
        `/login?registered=success&email=${encodeURIComponent(
          email.trim().toLowerCase()
        )}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleSignup() {
    setError("");
    setGoogleLoading(true);
    window.location.href = `${API_URL}/auth/google/login`;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-white via-blue-50 to-cyan-50 px-4 py-5 sm:px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(37,99,235,0.15),transparent_30%),radial-gradient(circle_at_86%_18%,rgba(6,182,212,0.2),transparent_32%)]" />

      <Link
        href="/"
        className="relative z-20 inline-flex items-center gap-2 rounded-2xl border border-blue-100 bg-white/75 px-4 py-3 text-sm font-black text-slate-700 shadow-lg shadow-blue-100/60 backdrop-blur-2xl transition hover:-translate-y-0.5 hover:bg-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <div className="relative z-10 mx-auto grid max-w-7xl items-stretch gap-7 py-6 lg:min-h-[calc(100vh-90px)] lg:grid-cols-2">
        <motion.section
          initial={{ opacity: 0, x: -35, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.75 }}
          className="relative flex min-h-[660px] overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#101b78] via-[#24127d] to-[#0c0738] p-8 text-white shadow-[0_30px_100px_rgba(37,99,235,0.28)] sm:p-10 lg:p-12"
        >
          <div className="relative flex w-full flex-col justify-center">
            <div className="mb-14 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl">
                <Sparkles className="h-6 w-6 text-cyan-300" />
              </div>
              <div>
                <h1 className="text-2xl font-black">NeuroHire AI</h1>
                <p className="text-xs font-semibold text-blue-100">
                  Career Intelligence Platform
                </p>
              </div>
            </div>

            <h2 className="max-w-lg text-4xl font-black leading-tight sm:text-5xl">
              Start your{" "}
              <span className="bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">
                career AI
              </span>{" "}
              journey.
            </h2>

            <p className="mt-5 max-w-lg text-base leading-8 text-blue-100">
              Create your account to improve your CV, check ATS readiness, find
              matching jobs and practice AI mock interviews.
            </p>

            <div className="mt-9 space-y-5">
              {benefits.map((item, index) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.12 }}
                    className="flex gap-4"
                  >
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl">
                      <Icon className="h-6 w-6 text-cyan-300" />
                    </div>
                    <div>
                      <h3 className="font-black">{item.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-blue-100">
                        {item.text}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, x: 35, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.75 }}
          className="min-h-[660px]"
        >
          <BorderGlow
            animated
            className="h-full w-full"
            backgroundColor="rgba(255,255,255,0.84)"
            borderRadius={40}
            glowRadius={40}
            glowColor="215 95 65"
            colors={["#2563eb", "#7c3aed", "#06b6d4"]}
          >
            <div className="flex h-full flex-col justify-center p-7 sm:p-9 lg:p-12">
              <div className="mb-7 flex justify-end text-sm font-semibold text-slate-500">
                Already have an account?
                <Link href="/login" className="ml-2 font-black text-blue-600">
                  Sign in
                </Link>
              </div>

              <div className="mx-auto w-full max-w-lg">
                <h2 className="text-4xl font-black text-slate-950">Sign Up</h2>
                <p className="mt-2 text-sm font-semibold text-slate-500">
                  Create your account to access NeuroHire AI.
                </p>

                {error && (
                  <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                    {error}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleGoogleSignup}
                  disabled={googleLoading}
                  className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl border border-blue-100 bg-white px-5 py-3.5 text-sm font-black text-slate-800 shadow-sm transition hover:-translate-y-1 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {googleLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  ) : (
                    <GoogleIcon />
                  )}
                  Continue with Google
                </button>

                <div className="my-5 flex items-center gap-4 text-sm font-semibold text-slate-400">
                  <span className="h-px flex-1 bg-blue-100" />
                  or continue with email
                  <span className="h-px flex-1 bg-blue-100" />
                </div>

                <form
                  onSubmit={handleSignup}
                  className="space-y-4"
                  autoComplete="off"
                >
                  <label className="block">
                    <span className="mb-2 block text-sm font-black text-slate-800">
                      Full Name
                    </span>
                    <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white/85 px-4 py-3.5 shadow-sm transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">
                      <User className="h-5 w-5 text-slate-400" />
                      <input
                        name="neurohire-signup-name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-slate-400"
                        placeholder="Enter your full name"
                        autoComplete="off"
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-black text-slate-800">
                      Email Address
                    </span>
                    <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white/85 px-4 py-3.5 shadow-sm transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">
                      <Mail className="h-5 w-5 text-slate-400" />
                      <input
                        type="email"
                        name="neurohire-signup-email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-slate-400"
                        placeholder="Enter your email"
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="none"
                        spellCheck={false}
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-black text-slate-800">
                      Password
                    </span>
                    <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white/85 px-4 py-3.5 shadow-sm transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">
                      <Lock className="h-5 w-5 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="neurohire-signup-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-slate-400"
                        placeholder="Create a password"
                        autoComplete="new-password"
                        autoCorrect="off"
                        autoCapitalize="none"
                        spellCheck={false}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="text-slate-400 transition hover:text-blue-600"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 text-sm font-semibold leading-6 text-slate-600">
                    <input
                      type="checkbox"
                      checked={agree}
                      onChange={(event) => setAgree(event.target.checked)}
                      className="mt-1 h-4 w-4 rounded"
                    />
                    I agree to the Terms of Service and Privacy Policy.
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 px-5 py-4 text-sm font-black text-white shadow-xl shadow-blue-500/30 transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="ml-2 h-5 w-5 transition group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </BorderGlow>
        </motion.section>
      </div>
    </main>
  );
}