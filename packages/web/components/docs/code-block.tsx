"use client";

import { CopyButton } from "@/components/animate-ui/components/buttons/copy";
import { cn } from "@/lib/utils";

type CodeBlockProps = {
  code: string;
  className?: string;
  label?: string;
};

export function CodeBlock({ code, className, label }: CodeBlockProps) {
  return (
    <div className={cn("bloom-panel overflow-hidden rounded-xl", className)}>
      {label ? (
        <div className="flex items-center justify-between border-b border-border bg-bloom-surface px-3 py-1.5">
          <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            {label}
          </span>
          <CopyButton
            content={code}
            variant="ghost"
            size="xs"
            aria-label="Copy"
          />
        </div>
      ) : (
        <div className="flex justify-end px-2 pt-2">
          <CopyButton
            content={code}
            variant="ghost"
            size="xs"
            aria-label="Copy"
          />
        </div>
      )}
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-bloom-code sm:text-sm">
        <code>{code}</code>
      </pre>
    </div>
  );
}
