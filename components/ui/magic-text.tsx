"use client"

import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

export interface MagicTextProps {
  text: string;
  className?: string;
}

interface WordProps {
  children: string;
  progress: any;
  range: number[];
}

const Word: React.FC<WordProps> = ({ children, progress, range }) => {
  const opacity = useTransform(progress, range, [0, 1]);

  return (
    <span className="relative mr-[0.3em] mt-[0.25em] inline-block text-[clamp(20px,2.8vw,40px)] leading-[1.35]">
      <span className="absolute opacity-15">{children}</span>
      <motion.span style={{ opacity }}>{children}</motion.span>
    </span>
  );
};

export const MagicText: React.FC<MagicTextProps> = ({ text, className }) => {
  const container = useRef(null);

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start 0.85", "start 0.15"],
  });

  const words = text.split(" ");

  return (
    <p ref={container} className={`flex flex-wrap p-4 ${className ?? ''}`}>
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + 1 / words.length;

        return (
          <Word key={i} progress={scrollYProgress} range={[start, end]}>
            {word}
          </Word>
        );
      })}
    </p>
  );
};
