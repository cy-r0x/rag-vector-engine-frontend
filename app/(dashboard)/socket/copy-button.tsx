"use client";

import { useState } from "react";

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex h-8 shrink-0 items-center rounded-full border border-primary bg-canvas px-3 text-[13px] leading-none font-normal text-primary transition-colors hover:bg-primary/5"
    >
      {copied ? "Copied" : label}
    </button>
  );
}
