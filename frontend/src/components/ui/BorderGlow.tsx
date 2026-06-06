"use client";

import React, { useCallback, useEffect, useRef } from "react";

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

  return {
    h: Number(match[1]),
    s: Number(match[2]),
    l: Number(match[3]),
  };
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

export default function BorderGlow({
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

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const card = cardRef.current;
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
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
    },
    []
  );

  useEffect(() => {
    if (!animated || !cardRef.current) return;

    const card = cardRef.current;
    card.classList.add("sweep-active");
    card.style.setProperty("--edge-proximity", "100");
    card.style.setProperty("--cursor-angle", "120deg");

    const timer = window.setTimeout(() => {
      card.style.setProperty("--edge-proximity", "0");
      card.classList.remove("sweep-active");
    }, 1600);

    return () => window.clearTimeout(timer);
  }, [animated]);

  return (
    <>
      <style jsx global>{`
        .border-glow-card {
          position: relative;
          border-radius: var(--border-radius);
          padding: 1px;
          background: var(--card-bg);
          overflow: hidden;
          isolation: isolate;
        }

        .border-glow-card::before {
          content: "";
          position: absolute;
          inset: calc(var(--glow-padding) * -1);
          border-radius: inherit;
          background:
            conic-gradient(
              from var(--cursor-angle, 120deg),
              transparent 0deg,
              var(--glow-color-10) calc(var(--cone-spread) * 1deg),
              var(--glow-color-30) calc(var(--cone-spread) * 2deg),
              var(--glow-color-60) calc(var(--cone-spread) * 3deg),
              var(--glow-color) calc(var(--cone-spread) * 4deg),
              var(--glow-color-60) calc(var(--cone-spread) * 5deg),
              var(--glow-color-20) calc(var(--cone-spread) * 6deg),
              transparent calc(var(--cone-spread) * 7deg)
            ),
            var(--gradient-one),
            var(--gradient-two),
            var(--gradient-three);
          opacity: calc(var(--edge-proximity, 0) / 100);
          filter: blur(18px);
          z-index: -2;
          transition: opacity 220ms ease;
        }

        .border-glow-card::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background:
            linear-gradient(
              var(--cursor-angle, 120deg),
              transparent,
              var(--glow-color-50),
              transparent
            );
          opacity: calc(var(--edge-proximity, 0) / 100);
          pointer-events: none;
          z-index: 1;
          transition: opacity 220ms ease;
        }

        .edge-light {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background:
            var(--gradient-one),
            var(--gradient-two),
            var(--gradient-three);
          opacity: var(--fill-opacity);
          pointer-events: none;
          z-index: -1;
        }

        .border-glow-inner {
          position: relative;
          z-index: 2;
          height: 100%;
          width: 100%;
          border-radius: calc(var(--border-radius) - 1px);
        }

        .sweep-active::before,
        .sweep-active::after {
          transition: opacity 500ms ease;
        }
      `}</style>

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
    </>
  );
}