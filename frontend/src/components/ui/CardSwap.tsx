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
import "./CardSwap.css";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  customClass?: string;
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ customClass, className = "", ...rest }, ref) => {
    return (
      <div
        ref={ref}
        {...rest}
        className={`card ${customClass ?? ""} ${className}`.trim()}
      />
    );
  }
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

  const refs = useMemo(
    () => childArr.map(() => React.createRef<HTMLDivElement>()),
    [childArr.length]
  );

  const order = useRef<number[]>(childArr.map((_, i) => i));
  const intervalRef = useRef<number | null>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const total = refs.length;

    refs.forEach((ref, index) => {
      const el = ref.current;
      if (!el) return;

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
      const frontEl = refs[front].current;
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
        const el = refs[idx].current;
        if (!el) return;

        const slot = makeSlot(i, cardDistance, verticalDistance, refs.length);

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
        refs.length - 1,
        cardDistance,
        verticalDistance,
        refs.length
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

    const node = containerRef.current;

    if (pauseOnHover && node) {
      const pause = () => {
        tlRef.current?.pause();
        if (intervalRef.current) clearInterval(intervalRef.current);
      };

      const resume = () => {
        tlRef.current?.play();
        intervalRef.current = window.setInterval(swap, delay);
      };

      node.addEventListener("mouseenter", pause);
      node.addEventListener("mouseleave", resume);

      return () => {
        node.removeEventListener("mouseenter", pause);
        node.removeEventListener("mouseleave", resume);
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [cardDistance, verticalDistance, delay, pauseOnHover, skewAmount, easing, refs]);

  const rendered = childArr.map((child, index) => {
    if (!isValidElement(child)) return child;

    return cloneElement(child as React.ReactElement<CardProps>, {
      key: index,
      ref: refs[index],
      style: {
        width,
        height,
        ...((child as React.ReactElement<CardProps>).props.style ?? {}),
      },
    });
  });

  return (
    <div
      ref={containerRef}
      className="card-swap-container"
      style={{ width, height }}
    >
      {rendered}
    </div>
  );
}