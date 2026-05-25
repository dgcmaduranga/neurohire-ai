"use client";

import { motion } from "framer-motion";

type BlurTextProps = {
  text: string;
  className?: string;
  delay?: number;
};

export default function BlurText({
  text,
  className = "",
  delay = 0.08,
}: BlurTextProps) {
  const words = text.split(" ");

  return (
    <h1 className={className}>
      {words.map((word, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 35, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.55,
            delay: index * delay,
            ease: "easeOut",
          }}
          className="inline-block"
        >
          {word}&nbsp;
        </motion.span>
      ))}
    </h1>
  );
}