"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { markdownComponents } from "../../markdown-components";

type Tab = "preview" | "source";

export function MarkdownView({ markdown }: { markdown: string }) {
  const [tab, setTab] = useState<Tab>("preview");
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <section className="rounded-[12px] border border-hairline bg-canvas shadow-level-1">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-6 py-3">
        <div role="tablist" aria-label="View" className="flex gap-1 rounded-full bg-canvas-soft p-1">
          {(["preview", "source"] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              aria-controls={`markdown-${value}`}
              onClick={() => setTab(value)}
              className={`rounded-full px-3 py-1.5 text-[13px] leading-none transition-colors ${
                tab === value ? "bg-canvas font-normal text-ink shadow-level-1" : "text-ink-mute hover:text-ink"
              }`}
            >
              {value === "preview" ? "Preview" : "Markdown source"}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={copy}
          className="inline-flex h-8 items-center rounded-full border border-primary bg-canvas px-3 text-[13px] leading-none font-normal text-primary transition-colors hover:bg-primary/5"
        >
          {copied ? "Copied" : "Copy Markdown"}
        </button>
      </div>

      {tab === "preview" ? (
        <div id="markdown-preview" role="tabpanel" className="px-8 py-6">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {markdown}
          </ReactMarkdown>
        </div>
      ) : (
        <pre
          id="markdown-source"
          role="tabpanel"
          className="max-h-[70vh] overflow-auto px-8 py-6 font-mono text-[13px] leading-[1.6] whitespace-pre-wrap text-ink-secondary"
        >
          {markdown}
        </pre>
      )}
    </section>
  );
}
