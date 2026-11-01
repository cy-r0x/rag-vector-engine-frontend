import type { Metadata } from "next";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";

import { getJson, getText } from "@/lib/api";
import { formatBytes, mimeLabel, type DocumentSummary } from "@/lib/documents";
import { requireAccessToken } from "@/lib/session";

import { LocalTime } from "../local-time";
import { StatusPill } from "../status-pill";
import { MarkdownView } from "./markdown-view";

const MAX_RENDERED_CHARS = 500_000;

export const metadata: Metadata = {
  title: "Document",
};

export default function DocumentViewerPage({ params }: { params: Promise<{ docId: string }> }) {
  return (
    <div className="flex flex-col gap-6">
      <Link href="/documents" className="w-fit text-[14px] font-normal text-primary hover:text-primary-deep">
        ← Documents
      </Link>
      <Suspense fallback={<ViewerSkeleton />}>
        <DocumentViewer params={params} />
      </Suspense>
    </div>
  );
}

async function DocumentViewer({ params }: { params: Promise<{ docId: string }> }) {
  const { docId } = await params;
  const token = await requireAccessToken();
  const id = encodeURIComponent(docId);

  const document = await getJson<DocumentSummary>(`/v1/documents/${id}`, token);
  if (!document.ok) {
    const missing = document.status === 404 || document.status === 422;
    return (
      <Notice tone={missing ? "neutral" : "error"} title={missing ? "Document not found" : "Couldn't load the document"}>
        {missing ? "It may have been deleted, or it belongs to another business." : document.detail}
      </Notice>
    );
  }

  const doc = document.data;
  return (
    <>
      <header>
        <h1 className="text-[32px] leading-[1.1] font-light tracking-[-0.64px] break-words text-ink">{doc.filename}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] tracking-[-0.39px] text-ink-mute [font-feature-settings:'tnum']">
          <StatusPill status={doc.status} />
          <span>{mimeLabel(doc.detected_mime)}</span>
          <span aria-hidden>·</span>
          <span>{formatBytes(doc.size_bytes)}</span>
          <span aria-hidden>·</span>
          <span>
            Uploaded <LocalTime iso={doc.created_at} />
          </span>
        </div>
      </header>
      <ExtractedMarkdown doc={doc} token={token} />
    </>
  );
}

async function ExtractedMarkdown({ doc, token }: { doc: DocumentSummary; token: string }) {
  if (doc.status === "FAILED") {
    return (
      <Notice tone="error" title="This document could not be processed">
        {doc.status_detail ?? "No reason was recorded for this failure."}
      </Notice>
    );
  }
  if (doc.status !== "INDEXED") {
    return (
      <Notice tone="neutral" title="Not ready yet">
        The extracted Markdown appears here once the document is indexed. Check back in a moment.
      </Notice>
    );
  }

  const result = await getText(`/v1/documents/${encodeURIComponent(doc.doc_id)}/markdown`, token);
  if (!result.ok) {
    return (
      <Notice tone="error" title="Couldn't load the extracted Markdown">
        {result.detail}
      </Notice>
    );
  }

  const truncated = result.data.length > MAX_RENDERED_CHARS;
  return (
    <>
      {truncated && (
        <Notice tone="neutral" title="Large document">
          Showing the first {MAX_RENDERED_CHARS.toLocaleString("en-US")} of{" "}
          {result.data.length.toLocaleString("en-US")} characters.
        </Notice>
      )}
      <MarkdownView markdown={truncated ? result.data.slice(0, MAX_RENDERED_CHARS) : result.data} />
    </>
  );
}

function Notice({ tone, title, children }: { tone: "neutral" | "error"; title: string; children: ReactNode }) {
  return (
    <section
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-[12px] border p-6 ${tone === "error" ? "border-ruby/25 bg-ruby/5" : "border-hairline bg-canvas"}`}
    >
      <h2 className={`text-[18px] font-light ${tone === "error" ? "text-ruby" : "text-ink"}`}>{title}</h2>
      <p className={`mt-1 text-[15px] ${tone === "error" ? "text-ruby" : "text-ink-mute"}`}>{children}</p>
    </section>
  );
}

function ViewerSkeleton() {
  return (
    <div aria-busy className="flex animate-pulse flex-col gap-4">
      <div className="h-8 w-2/3 rounded-[6px] bg-hairline" />
      <div className="h-4 w-1/3 rounded-[4px] bg-hairline" />
      <div className="mt-2 h-64 w-full rounded-[12px] bg-hairline" />
    </div>
  );
}
