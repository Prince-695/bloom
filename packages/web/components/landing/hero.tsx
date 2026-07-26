"use client";

import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { BookOpenIcon, TerminalIcon } from "lucide-react";

import { TerminalChassis } from "@/components/landing/terminal-chassis";
import { BloomLogo } from "@/components/site/bloom-logo";
import { Button } from "@/components/ui/button";
import { Button as MovingBorderButton } from "@/components/ui/moving-border";

gsap.registerPlugin(useGSAP);

export function LandingHero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero-brand", { y: 28, opacity: 0, duration: 0.75 })
        .from(".hero-line", { y: 22, opacity: 0, duration: 0.55 }, "-=0.35")
        .from(".hero-cta", { y: 18, opacity: 0, duration: 0.5 }, "-=0.25")
        .from(".hero-terminal", { y: 48, opacity: 0, duration: 0.9 }, "-=0.55");
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="relative overflow-hidden border-b border-border"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_15%_0%,color-mix(in_oklab,var(--primary)_16%,transparent),transparent_55%),radial-gradient(ellipse_50%_40%_at_90%_20%,color-mix(in_oklab,var(--bloom-thinking)_12%,transparent),transparent_50%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.18] bloom-grid"
        style={{
          maskImage:
            "linear-gradient(180deg, black 0%, black 40%, transparent 90%)",
        }}
      />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:gap-12 lg:py-20">
        <div className="flex flex-col items-start gap-7">
          <div className="hero-brand flex items-center gap-4">
            <BloomLogo href={null} showWordmark={false} size={72} />
            <p className="font-mono text-xs tracking-[0.35em] text-bloom-gold uppercase">
              Bloom
            </p>
          </div>

          <div className="hero-line flex flex-col gap-4">
            <h1 className="font-display text-[clamp(2.75rem,7vw,4.75rem)] leading-[0.95] font-bold tracking-tight text-foreground">
              Bloom
              <span className="text-bloom-gold">.</span>
              <br />
              <span className="text-primary">in the terminal.</span>
            </h1>
            <p className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
              A physical-feeling AI coding agent for your shell — themes,
              sessions, and edits without leaving the TUI.
            </p>
          </div>

          <div className="hero-cta flex flex-wrap items-center gap-3">
            <MovingBorderButton
              as={Link}
              href="/docs/install"
              borderRadius="0.45rem"
              containerClassName="h-12 w-auto p-[2px]"
              borderClassName="bg-[radial-gradient(var(--bloom-selection)_40%,transparent_60%)]"
              className="border-2 border-border bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[4px_4px_0_0_var(--bloom-shadow)]"
              duration={3200}
            >
              <span className="inline-flex items-center gap-2">
                <TerminalIcon className="size-4" />
                Install CLI
              </span>
            </MovingBorderButton>
            <Button
              size="lg"
              variant="outline"
              className="h-12 border-2 bg-transparent px-5 shadow-[3px_3px_0_0_var(--bloom-shadow)]"
              render={<Link href="/docs" />}
            >
              <BookOpenIcon data-icon="inline-start" />
              Read docs
            </Button>
          </div>
        </div>

        <div className="hero-terminal relative">
          <div
            aria-hidden
            className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_50%_40%,color-mix(in_oklab,var(--bloom-selection)_20%,transparent),transparent_65%)]"
          />
          <TerminalChassis className="relative" />
        </div>
      </div>
    </section>
  );
}
