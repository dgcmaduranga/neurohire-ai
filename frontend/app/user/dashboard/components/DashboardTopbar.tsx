"use client";

import { useEffect, useState } from "react";
import { Menu, Search, User } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type UserType = {
  name: string;
  email: string;
};

export default function DashboardTopbar() {
  const [user, setUser] = useState<UserType | null>(null);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("token");

      if (!token || !API_URL) return;

      try {
        const res = await fetch(`${API_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (res.ok) {
          setUser(data.user || data);
        }
      } catch (error) {
        console.log("User fetch failed:", error);
      }
    }

    loadUser();

    window.addEventListener("user-updated", loadUser);

    return () => {
      window.removeEventListener("user-updated", loadUser);
    };
  }, []);

  const displayName = user?.name || "User";
  const displayEmail = user?.email || "user@email.com";

  return (
    <header className="sticky top-0 z-30 border-b border-blue-100 bg-white/90 px-3 py-3 shadow-sm backdrop-blur-xl sm:px-5 lg:px-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-blue-100 bg-white text-slate-700 shadow-sm lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 sm:text-[11px]">
              Dashboard
            </p>

            <h2 className="max-w-[170px] truncate text-sm font-black text-slate-950 xs:max-w-[220px] sm:max-w-none sm:text-xl">
              Welcome back, {displayName}
            </h2>
          </div>
        </div>

        <div className="hidden flex-1 justify-center md:flex">
          <div className="flex w-full max-w-md items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3">
            <Search className="h-5 w-5 shrink-0 text-slate-400" />

            <input
              type="text"
              placeholder="Search features..."
              className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setShowMobileSearch((prev) => !prev)}
            className="grid h-10 w-10 place-items-center rounded-2xl border border-blue-100 bg-white text-slate-700 shadow-sm md:hidden"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2 rounded-2xl border border-blue-100 bg-white p-1.5 shadow-sm sm:px-3 sm:py-2">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white sm:h-10 sm:w-10">
              <User className="h-5 w-5" />
            </div>

            <div className="hidden min-w-0 sm:block">
              <p className="max-w-28 truncate text-sm font-black text-slate-800 md:max-w-40">
                {displayName}
              </p>

              <p className="max-w-32 truncate text-xs font-semibold text-slate-500 md:max-w-48">
                {displayEmail}
              </p>
            </div>
          </div>
        </div>
      </div>

      {showMobileSearch && (
        <div className="mt-3 md:hidden">
          <div className="flex w-full items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3">
            <Search className="h-5 w-5 shrink-0 text-slate-400" />

            <input
              type="text"
              autoFocus
              placeholder="Search features..."
              className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>
      )}
    </header>
  );
}