import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

/** Cache-bust when the public asset is replaced (Next/browser can keep old /logo.png). */
export const BLOOM_LOGO_SRC = "/logo.png?v=2";

type BloomLogoProps = {
  className?: string;
  href?: string | null;
  showWordmark?: boolean;
  size?: number;
};

export function BloomLogo({
  className,
  href = "/",
  showWordmark = true,
  size = 36,
}: BloomLogoProps) {
  const mark = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className="bloom-brutal-sm relative inline-flex shrink-0 overflow-hidden rounded-md bg-black bloom-emboss"
        style={{ width: size, height: size }}
      >
        <Image
          src={BLOOM_LOGO_SRC}
          alt="Bloom"
          width={size}
          height={size}
          className="size-full object-contain"
          priority
          unoptimized
        />
      </span>
      {showWordmark ? (
        <span className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Bloom
          <span className="text-bloom-gold">.</span>
        </span>
      ) : null}
    </span>
  );

  if (!href) return mark;

  return (
    <Link
      href={href}
      className="outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {mark}
    </Link>
  );
}
