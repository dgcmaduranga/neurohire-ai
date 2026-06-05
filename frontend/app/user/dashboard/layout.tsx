"use client";

import { ReactNode } from "react";
import DashboardSidebar from "./components/DashboardSidebar";
import DashboardTopbar from "./components/DashboardTopbar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <main className="h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="flex h-screen">
        <DashboardSidebar />

        <div className="flex h-screen flex-1 flex-col overflow-hidden">
          <DashboardTopbar />

          <section className="flex-1 overflow-y-auto p-5 lg:p-8">
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}