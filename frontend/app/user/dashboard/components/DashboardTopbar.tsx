"use client";

import { useEffect, useState } from "react";
import { Search, User } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type UserType = {
  name: string;
  email: string;
};

export default function DashboardTopbar() {
  const [user, setUser] = useState<UserType | null>(null);

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

  return (
    <header className="sticky top-0 z-30 border-b border-blue-100 bg-white/90 px-4 py-4 shadow-sm backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-widest text-blue-600">
            Dashboard
          </p>

          <h2 className="truncate text-base font-black text-slate-950 sm:text-xl">
            Welcome back, {user?.name || "User"}
          </h2>
        </div>

        <div className="hidden flex-1 justify-center md:flex">
          <div className="flex w-full max-w-md items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3">
            <Search className="h-5 w-5 text-slate-400" />

            <input
              type="text"
              placeholder="Search features..."
              className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white px-3 py-2 shadow-sm">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
            <User className="h-5 w-5" />
          </div>

          <div className="hidden sm:block">
            <p className="max-w-40 truncate text-sm font-black text-slate-800">
              {user?.name || "User"}
            </p>

            <p className="max-w-48 truncate text-xs font-semibold text-slate-500">
              {user?.email || "user@email.com"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}