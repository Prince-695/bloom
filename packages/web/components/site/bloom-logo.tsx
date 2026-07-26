import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

type BloomLogoProps = {
  className?: string;
  href?: string;
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
      <span className="bloom-brutal-sm relative inline-flex shrink-0 overflow-hidden rounded-md bg-bloom-surface bloom-emboss">
        <Image
          src="/logo.png"
          alt="Bloom"
          width={size}
          height={size}
          className="object-cover"
          priority
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
    <Link href={href} className="outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {mark}
    </Link>
  );
}
