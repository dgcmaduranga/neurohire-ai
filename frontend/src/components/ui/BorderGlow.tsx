"use client";

import { useRef, useCallback, useEffect } from "react";
import "./BorderGlow.css";

type BorderGlowProps = {
  children: React.ReactNode;
  className?: string;
  edgeSensitivity?: number;
  glowColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  glowRadius?: number;
  glowIntensity?: number;
  coneSpread?: number;
  animated?: boolean;
  colors?: string[];
  fillOpacity?: number;
};

function parseHSL(hslStr: string) {
  const match = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
  if (!match) return { h: 40, s: 80, l: 80 };
  return { h: Number(match[1]), s: Number(match[2]), l: Number(match[3]) };
}

function buildGlowVars(glowColor: string, intensity: number) {
  const { h, s, l } = parseHSL(glowColor);
  const base = `${h}deg ${s}% ${l}%`;
  const opacities = [100, 60, 50, 40, 30, 20, 10];
  const keys = ["", "-60", "-50", "-40", "-30", "-20", "-10"];
  const vars: Record<string, string> = {};

  opacities.forEach((opacity, i) => {
    vars[`--glow-color${keys[i]}`] = `hsl(${base} / ${Math.min(
      opacity * intensity,
      100
    )}%)`;
  });

  return vars;
}

function BorderGlow({
  children,
  className = "",
  edgeSensitivity = 30,
  glowColor = "220 90 65",
  backgroundColor = "rgba(255,255,255,0.72)",
  borderRadius = 32,
  glowRadius = 38,
  glowIntensity = 1,
  coneSpread = 25,
  animated = true,
  colors = ["#2563eb", "#7c3aed", "#06b6d4"],
  fillOpacity = 0.35,
}: BorderGlowProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    const dx = x - cx;
    const dy = y - cy;
    const edge = Math.min(
      Math.max(1 / Math.min(cx / Math.abs(dx || 1), cy / Math.abs(dy || 1)), 0),
      1
    );

    let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;

    card.style.setProperty("--edge-proximity", `${edge * 100}`);
    card.style.setProperty("--cursor-angle", `${angle}deg`);
  }, []);

  useEffect(() => {
    if (!animated || !cardRef.current) return;
    const card = cardRef.current;
    card.classList.add("sweep-active");
    card.style.setProperty("--edge-proximity", "100");
    card.style.setProperty("--cursor-angle", "120deg");

    const timer = setTimeout(() => {
      card.style.setProperty("--edge-proximity", "0");
      card.classList.remove("sweep-active");
    }, 1600);

    return () => clearTimeout(timer);
  }, [animated]);

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      className={`border-glow-card ${className}`}
      style={
        {
          "--card-bg": backgroundColor,
          "--edge-sensitivity": edgeSensitivity,
          "--border-radius": `${borderRadius}px`,
          "--glow-padding": `${glowRadius}px`,
          "--cone-spread": coneSpread,
          "--fill-opacity": fillOpacity,
          "--gradient-one": `radial-gradient(at 80% 55%, ${colors[0]} 0px, transparent 50%)`,
          "--gradient-two": `radial-gradient(at 20% 20%, ${colors[1]} 0px, transparent 50%)`,
          "--gradient-three": `radial-gradient(at 50% 90%, ${colors[2]} 0px, transparent 50%)`,
          ...buildGlowVars(glowColor, glowIntensity),
        } as React.CSSProperties
      }
    >
      <span className="edge-light" />
      <div className="border-glow-inner">{children}</div>
    </div>
  );
}

export default BorderGlow;