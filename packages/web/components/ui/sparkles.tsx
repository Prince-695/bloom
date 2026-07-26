"use client";

import { useMemo } from "react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

type SparklesProps = {
  id?: string;
  className?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  particleColor?: string;
  particleDensity?: number;
};

/** Lightweight Bloom sparkles (tsparticles types lag Aceternity's registry). */
export function SparklesCore({
  className,
  background = "transparent",
  minSize = 0.6,
  maxSize = 1.4,
  particleColor = "#FFB7C5",
  particleDensity = 48,
}: SparklesProps) {
  const particles = useMemo(() => {
    return Array.from({ length: particleDensity }, (_, index) => {
      const size = minSize + Math.random() * (maxSize - minSize);
      return {
        id: index,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size,
        delay: Math.random() * 4,
        duration: 2 + Math.random() * 3,
      };
    });
  }, [maxSize, minSize, particleDensity]);

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={{ background }}
      aria-hidden
    >
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
            backgroundColor: particleColor,
          }}
          animate={{ opacity: [0.15, 0.9, 0.15], scale: [0.8, 1.2, 0.8] }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
