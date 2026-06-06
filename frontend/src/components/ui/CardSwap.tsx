"use client";

import React, {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
} from "react";
import gsap from "gsap";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  customClass?: string;
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ customClass, className = "", ...rest }, ref) => (
    <div
      ref={ref}
      {...rest}
      className={`card ${customClass ?? ""} ${className}`.trim()}
    />
  )
);

Card.displayName = "Card";

type CardSwapProps = {
  width?: number | string;
  height?: number | string;
  cardDistance?: number;
  verticalDistance?: number;
  delay?: number;
  pauseOnHover?: boolean;
  skewAmount?: number;
  easing?: "linear" | "elastic";
  children: React.ReactNode;
};

const makeSlot = (i: number, distX: number, distY: number, total: number) => ({
  x: i * distX,
  y: -i * distY,
  z: -i * distX * 1.5,
  zIndex: total - i,
});

export default function CardSwap({
  width = 520,
  height = 390,
  cardDistance = 55,
  verticalDistance = 58,
  delay = 3600,
  pauseOnHover = false,
  skewAmount = 2,
  easing = "elastic",
  children,
}: CardSwapProps) {
  const childArr = useMemo(() => Children.toArray(children), [children]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const order = useRef<number[]>([]);
  const intervalRef = useRef<number | null>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cards = Array.from(
      container.querySelectorAll<HTMLDivElement>(".card")
    );

    order.current = cards.map((_, i) => i);

    const total = cards.length;

    cards.forEach((el, index) => {
      const slot = makeSlot(index, cardDistance, verticalDistance, total);

      gsap.set(el, {
        x: slot.x,
        y: slot.y,
        z: slot.z,
        xPercent: -50,
        yPercent: -50,
        skewY: skewAmount,
        transformOrigin: "center center",
        zIndex: slot.zIndex,
        force3D: true,
      });
    });

    const config =
      easing === "elastic"
        ? {
            ease: "elastic.out(0.6,0.9)",
            durDrop: 1.4,
            durMove: 1.2,
            durReturn: 1.3,
          }
        : {
            ease: "power1.inOut",
            durDrop: 0.8,
            durMove: 0.8,
            durReturn: 0.8,
          };

    const swap = () => {
      if (order.current.length < 2) return;

      const [front, ...rest] = order.current;
      const frontEl = cards[front];
      if (!frontEl) return;

      const tl = gsap.timeline();
      tlRef.current = tl;

      tl.to(frontEl, {
        y: "+=470",
        opacity: 0.35,
        duration: config.durDrop,
        ease: config.ease,
      });

      rest.forEach((idx, i) => {
        const el = cards[idx];
        if (!el) return;

        const slot = makeSlot(i, cardDistance, verticalDistance, total);

        tl.set(el, { zIndex: slot.zIndex }, "-=1");
        tl.to(
          el,
          {
            x: slot.x,
            y: slot.y,
            z: slot.z,
            duration: config.durMove,
            ease: config.ease,
          },
          "-=1"
        );
      });

      const backSlot = makeSlot(
        total - 1,
        cardDistance,
        verticalDistance,
        total
      );

      tl.set(frontEl, { zIndex: backSlot.zIndex, opacity: 1 });
      tl.to(frontEl, {
        x: backSlot.x,
        y: backSlot.y,
        z: backSlot.z,
        duration: config.durReturn,
        ease: config.ease,
      });

      tl.call(() => {
        order.current = [...rest, front];
      });
    };

    swap();
    intervalRef.current = window.setInterval(swap, delay);

    const pause = () => {
      tlRef.current?.pause();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

    const resume = () => {
      tlRef.current?.play();
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = window.setInterval(swap, delay);
    };

    if (pauseOnHover) {
      container.addEventListener("mouseenter", pause);
      container.addEventListener("mouseleave", resume);
    }

    return () => {
      if (pauseOnHover) {
        container.removeEventListener("mouseenter", pause);
        container.removeEventListener("mouseleave", resume);
      }

      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [
    childArr.length,
    cardDistance,
    verticalDistance,
    delay,
    pauseOnHover,
    skewAmount,
    easing,
  ]);

  const rendered = childArr.map((child, index) => {
    if (!isValidElement(child)) return child;

    const element = child as React.ReactElement<CardProps>;

    return cloneElement(element, {
      key: index,
      style: {
        width,
        height,
        ...(element.props.style ?? {}),
      },
    });
  });

  return (
    <>
      <style jsx global>{`
        .card-swap-container {
          position: absolute;
          top: 52%;
          left: 50%;
          width: min(520px, 100%) !important;
          height: 400px;
          transform: translate(-50%, -50%);
          transform-origin: center;
          perspective: 1200px;
          overflow: visible;
        }

        .card {
          position: absolute;
          top: 50%;
          left: 50%;
          border-radius: 32px;
          border: 1px solid rgba(191, 219, 254, 0.9);
          background: rgba(255, 255, 255, 0.92);
          transform-style: preserve-3d;
          will-change: transform;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          box-shadow: 0 35px 100px rgba(37, 99, 235, 0.2);
          backdrop-filter: blur(24px);
          overflow: hidden;
        }
      `}</style>

      <div
        ref={containerRef}
        className="card-swap-container"
        style={{ width, height }}
      >
        {rendered}
      </div>
    </>
  );
}