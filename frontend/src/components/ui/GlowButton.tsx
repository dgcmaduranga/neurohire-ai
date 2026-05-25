import Link from "next/link";

type GlowButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
};

export default function GlowButton({ href, children, variant = "primary" }: GlowButtonProps) {
  return (
    <Link
      href={href}
      className={
        variant === "primary"
          ? "inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 px-7 py-4 text-sm font-black text-white shadow-xl shadow-blue-500/25 transition hover:-translate-y-1 hover:shadow-blue-500/40"
          : "inline-flex items-center justify-center rounded-2xl border border-blue-100 bg-white/70 px-7 py-4 text-sm font-black text-slate-950 shadow-lg shadow-blue-100/60 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white"
      }
    >
      {children}
    </Link>
  );
}