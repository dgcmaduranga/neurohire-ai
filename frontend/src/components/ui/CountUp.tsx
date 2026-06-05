"use client";

import { useEffect, useRef, useState } from "react";

type CountUpProps = {
  from?: number;
  to: number;
  duration?: number;
  delay?: number;
  separator?: string;
  suffix?: string;
  className?: string;
};

export default function CountUp({
  from = 0,
  to,
  duration = 1600,
  delay = 0,
  separator = "",
  suffix = "",
  className = "",
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStart(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!start) return;

    let frame = 0;
    let startTime: number | null = null;
    let timer: NodeJS.Timeout;

    const format = (value: number) => {
      const rounded = Math.round(value);
      const formatted = separator
        ? rounded.toLocaleString("en-US").replace(/,/g, separator)
        : rounded.toLocaleString("en-US");

      return `${formatted}${suffix}`;
    };

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * ease;

      if (ref.current) ref.current.textContent = format(current);

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    timer = setTimeout(() => {
      frame = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [start, from, to, duration, delay, separator, suffix]);

  return (
    <span ref={ref} className={className}>
      {from}
      {suffix}
    </span>
  );
}