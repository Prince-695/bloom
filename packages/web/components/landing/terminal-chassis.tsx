"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

import { TypingText } from "@/components/animate-ui/primitives/texts/typing";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

type TerminalChassisProps = {
  className?: string;
};

export function TerminalChassis({ className }: TerminalChassisProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(".chassis-chrome", {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });
      gsap.from(".chassis-line", {
        opacity: 0,
        x: -10,
        stagger: 0.1,
        delay: 0.4,
        duration: 0.45,
        ease: "power2.out",
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className={cn("relative w-full", className)}>
      {/* outer bezel — skeuomorphic machine */}
      <div className="chassis-chrome relative rounded-2xl border-[3px] border-[#6b4558] bg-linear-to-b from-[#2c1a28] via-[#1a101c] to-[#100814] p-2 shadow-[8px_8px_0_0_#3a1024] sm:p-3">
        <div className="mb-2 flex items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full border-2 border-[#5a2038] bg-[#ff6b6b] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]" />
            <span className="size-3 rounded-full border-2 border-[#5a4830] bg-[#ffd700] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]" />
            <span className="size-3 rounded-full border-2 border-[#2a4a3a] bg-[#a8e6cf] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]" />
          </div>
          <span className="font-mono text-[10px] tracking-[0.25em] text-[#a8909a] uppercase">
            bloom · tty
          </span>
          <span className="hidden font-mono text-[10px] text-[#5a3a4a] sm:inline">
            v0.1
          </span>
        </div>

        <div className="relative overflow-hidden rounded-xl border-2 border-[#4a1830] bg-[#09060c] shadow-[inset_0_2px_12px_rgba(0,0,0,0.65)]">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,183,197,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,183,197,0.35) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-linear-to-b from-[#ffb7c5]/10 to-transparent" />

          <div className="relative flex min-h-[280px] flex-col gap-2.5 p-5 font-mono text-[13px] leading-relaxed sm:min-h-[340px] sm:p-7 sm:text-sm">
            <p className="chassis-line text-[#a8909a]">
              <span className="text-[#ffd700]">~/work</span>{" "}
              <span className="text-[#ffb7c5]">❯</span> bloom
            </p>
            <p className="chassis-line text-[#ffd6e7]">
              ┌─ Bloom ──────────────────────────┐
            </p>
            <p className="chassis-line text-[#f5e6ec]">
              │ terminal-first coding agent{" "}
              <span className="text-[#a8e6cf]">ready</span>
            </p>
            <p className="chassis-line text-[#f5e6ec]">
              │ model · session ·{" "}
              <span className="text-[#a8e6cf]">10/10</span> requests
            </p>
            <p className="chassis-line text-[#ffd6e7]">
              └──────────────────────────────────┘
            </p>
            <p className="chassis-line text-[#a8909a]">
              <span className="text-[#d81b60]">thinking</span>
              <span className="text-[#5a3a4a]"> · </span>
              tracing the failing path…
            </p>
            <p className="chassis-line text-[#a8e6cf]">
              + fixed packages/cli/src/agent.ts
            </p>
            <p className="chassis-line mt-1 text-[#ffb7c5]">
              ❯{" "}
              <TypingText
                text={[
                  "refactor the auth handoff",
                  "write the missing tests",
                  "ship the release build",
                ]}
                loop
                duration={36}
                holdDelay={1800}
                className="text-[#ffb7c5]"
              />
              <span className="ml-1 inline-block h-[1.1em] w-[0.55em] translate-y-[2px] animate-pulse bg-[#ffb7c5]" />
            </p>

            <div className="mt-auto flex items-center justify-between border-t border-[#4a1830] pt-3 text-[11px] text-[#a8909a]">
              <span>build · plan mode</span>
              <span className="text-[#ffd700]">Bloom</span>
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-3 px-1">
          <div className="h-1.5 flex-1 rounded-full border border-[#6b4558] bg-[#1a1018] shadow-[inset_0_1px_3px_rgba(0,0,0,0.7)]" />
          <div className="size-7 rounded-full border-2 border-[#6b4558] bg-linear-to-br from-[#4a2840] to-[#1a0c16] shadow-[inset_0_1px_0_rgba(255,255,255,0.15),3px_3px_0_0_#3a1024]" />
        </div>
      </div>
    </div>
  );
}
