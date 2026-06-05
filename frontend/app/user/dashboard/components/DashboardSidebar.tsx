"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertTriangle,
  Briefcase,
  FileText,
  Headphones,
  Home,
  LogOut,
  Mail,
  Menu,
  Mic,
  User,
  X,
} from "lucide-react";
import { useState } from "react";

const menuItems = [
  { name: "Dashboard", href: "/user/dashboard", icon: Home },
  {
    name: "Resume Analyzer",
    href: "/user/dashboard/resume-analyzer",
    icon: FileText,
  },
  { name: "Job Discovery", href: "/user/dashboard/jobs", icon: Briefcase },
  { name: "AI Interview", href: "/user/dashboard/interview", icon: Mic },
  { name: "Profile", href: "/user/dashboard/profile", icon: User },
];

const SUPPORT_EMAIL = "support@neurohire.ai";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  }

  function handleLogoutClick() {
    setMobileOpen(false);
    setLogoutOpen(true);
  }

  function isActive(href: string) {
    return (
      pathname === href ||
      (href !== "/user/dashboard" && pathname.startsWith(href))
    );
  }

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-100 bg-white text-slate-800 shadow-lg lg:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
          />

          <aside className="relative flex h-full w-[86%] max-w-80 flex-col border-r border-blue-100 bg-white p-5 shadow-2xl">
            <SidebarContent
              isActive={isActive}
              logout={handleLogoutClick}
              closeMobile={() => setMobileOpen(false)}
              mobile
              openHelp={() => setHelpOpen(true)}
            />
          </aside>
        </div>
      )}

      <aside className="hidden h-screen w-72 shrink-0 border-r border-blue-100 bg-white p-5 shadow-xl shadow-blue-100/40 lg:sticky lg:top-0 lg:flex lg:flex-col">
        <SidebarContent
          isActive={isActive}
          logout={handleLogoutClick}
          openHelp={() => setHelpOpen(true)}
        />
      </aside>

      {helpOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] border border-blue-100 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                  <Headphones className="h-6 w-6" />
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-blue-600">
                    Need Help
                  </p>
                  <h2 className="text-xl font-black text-slate-950">
                    Contact Support
                  </h2>
                </div>
              </div>

              <button
                onClick={() => setHelpOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-4 text-sm font-semibold leading-7 text-slate-500">
              If you need help with resume analysis, job discovery, interview
              practice, or your account, contact our support team.
            </p>

            <div className="mt-5 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                Support Email
              </p>

              <div className="mt-3 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
                <Mail className="h-5 w-5 shrink-0 text-blue-600" />
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="break-all text-sm font-black text-slate-800 hover:text-blue-600"
                >
                  {SUPPORT_EMAIL}
                </a>
              </div>
            </div>

            <button
              onClick={() => setHelpOpen(false)}
              className="mt-6 w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-1 hover:bg-blue-600"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {logoutOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[2rem] border border-red-100 bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-red-50 text-red-600">
              <AlertTriangle className="h-8 w-8" />
            </div>

            <h2 className="mt-5 text-2xl font-black text-slate-950">
              Are you sure?
            </h2>

            <p className="mt-3 text-sm font-semibold leading-7 text-slate-500">
              Do you really want to logout from your NeuroHire AI account?
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => setLogoutOpen(false)}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={logout}
                className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-500/25 transition hover:-translate-y-1 hover:bg-red-700"
              >
                Sure, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SidebarContent({
  isActive,
  logout,
  closeMobile,
  mobile = false,
  openHelp,
}: {
  isActive: (href: string) => boolean;
  logout: () => void;
  closeMobile?: () => void;
  mobile?: boolean;
  openHelp: () => void;
}) {
  function handleHelpClick() {
    closeMobile?.();
    openHelp();
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <Link
          href="/user/dashboard"
          onClick={closeMobile}
          className="flex items-center gap-3"
        >
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-slate-950 shadow-lg shadow-blue-500/25">
            <img
              src="/logo.png"
              alt="NeuroHire AI Logo"
              className="h-16 w-16 scale-[1.85] object-contain"
            />
          </div>

          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-950">
              NeuroHire <span className="text-blue-600">AI</span>
            </h1>
            <p className="text-xs font-bold text-slate-500">Career Platform</p>
          </div>
        </Link>

        {mobile && (
          <button
            onClick={closeMobile}
            className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-3 overflow-y-auto pr-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={closeMobile}
              className={`group flex items-center gap-4 rounded-2xl px-4 py-4 text-sm font-black transition-all duration-300 ${
                active
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25"
                  : "border border-transparent bg-white text-slate-600 hover:-translate-y-0.5 hover:border-blue-100 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md hover:shadow-blue-100/60"
              }`}
            >
              <div
                className={`grid h-10 w-10 place-items-center rounded-xl transition ${
                  active
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-blue-600"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>

              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
        <p className="text-xs font-black uppercase tracking-widest text-blue-600">
          Premium AI Tools
        </p>
        <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
          Resume analysis, job discovery and voice interview practice in one
          workspace.
        </p>
      </div>

      <button
        onClick={handleHelpClick}
        className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm font-black text-blue-600 shadow-sm transition hover:-translate-y-1 hover:bg-blue-50 hover:shadow-lg hover:shadow-blue-100/70"
      >
        <Headphones className="h-5 w-5" />
        Need Help
      </button>

      <button
        onClick={logout}
        className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-red-500/25 transition hover:-translate-y-1 hover:bg-red-700"
      >
        <LogOut className="h-5 w-5" />
        Logout
      </button>
    </>
  );
}