"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LayersIcon, PaletteIcon, TerminalIcon } from "lucide-react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const FEATURES = [
  {
    icon: TerminalIcon,
    title: "Built for the shell",
    body: "A TUI that feels like hardware — sessions, models, and flow without leaving your terminal.",
  },
  {
    icon: PaletteIcon,
    title: "Rose terminal themes",
    body: "Bloom’s palette ships in the CLI. Soft petals, hard edges, readable for long sessions.",
  },
  {
    icon: LayersIcon,
    title: "Agent that edits",
    body: "Plan, think, and ship code changes from the same surface you already live in.",
  },
] as const;

export function FeatureStrip() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(".feature-block", {
        scrollTrigger: {
          trigger: root.current,
          start: "top 80%",
        },
        y: 28,
        opacity: 0,
        stagger: 0.12,
        duration: 0.65,
        ease: "power3.out",
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="border-b border-border bg-bloom-surface/70">
      <div className="mx-auto grid w-full max-w-6xl gap-0 px-4 py-16 sm:px-6 md:grid-cols-3">
        {FEATURES.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className={`feature-block flex flex-col gap-3 px-1 py-5 md:px-6 ${
                index < FEATURES.length - 1
                  ? "md:border-r md:border-border"
                  : ""
              }`}
            >
              <div className="flex size-11 items-center justify-center rounded-md border-2 border-border bg-secondary text-secondary-foreground shadow-[3px_3px_0_0_var(--bloom-shadow)]">
                <Icon />
              </div>
              <h2 className="font-display text-xl font-bold tracking-tight">
                {feature.title}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.body}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
