import type { Metadata } from "next";
import { Suspense } from "react";

import { getJson } from "@/lib/api";
import { formatBytes, mimeLabel, type DocumentStatus, type DocumentSummary } from "@/lib/documents";
import { requireAccessToken } from "@/lib/session";

import { PageHeader } from "../page-header";
import { DocumentUploader } from "./document-uploader";
import { LocalTime } from "./local-time";
import { RefreshButton } from "./refresh-button";

export const metadata: Metadata = {
  title: "Documents",
};

export default function DocumentsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Documents"
        title="Document management"
        description="Upload your business documents and track their ingestion status."
      />
      <DocumentUploader />
      <section className="rounded-[12px] border border-hairline bg-canvas shadow-level-1">
        <div className="flex items-center justify-between gap-4 px-8 pt-8 pb-6">
          <h2 className="text-[22px] leading-[1.1] font-light tracking-[-0.22px] text-ink">Your documents</h2>
          <RefreshButton />
        </div>
        <Suspense fallback={<TableSkeleton />}>
          <DocumentTable />
        </Suspense>
      </section>
    </div>
  );
}

async function DocumentTable() {
  const token = await requireAccessToken();
  const result = await getJson<{ documents: DocumentSummary[] }>("/v1/documents", token);

  if (!result.ok) {
    return (
      <p role="alert" className="mx-8 mb-8 rounded-[8px] border border-ruby/25 bg-ruby/5 px-3 py-2.5 text-[14px] text-ruby">
        Couldn&apos;t load your documents: {result.detail}
      </p>
    );
  }

  const { documents } = result.data;
  if (documents.length === 0) {
    return (
      <p className="px-8 pb-8 text-[15px] text-ink-mute">No documents yet. Upload your first files above.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-[14px] tracking-[-0.42px]">
        <thead>
          <tr className="border-y border-hairline bg-canvas-soft text-[13px] text-ink-mute">
            <th scope="col" className="px-8 py-3 font-normal">Name</th>
            <th scope="col" className="px-4 py-3 font-normal">Type</th>
            <th scope="col" className="px-4 py-3 text-right font-normal">Size</th>
            <th scope="col" className="px-4 py-3 font-normal">Status</th>
            <th scope="col" className="px-8 py-3 font-normal">Uploaded</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline [font-feature-settings:'tnum']">
          {documents.map((doc) => (
            <tr key={doc.doc_id} className="text-ink-secondary">
              <td className="max-w-[320px] truncate px-8 py-3 text-ink" title={doc.filename}>
                {doc.filename}
              </td>
              <td className="px-4 py-3">{mimeLabel(doc.detected_mime)}</td>
              <td className="px-4 py-3 text-right">{formatBytes(doc.size_bytes)}</td>
              <td className="px-4 py-3">
                <StatusPill status={doc.status} />
              </td>
              <td className="px-8 py-3 whitespace-nowrap">
                <LocalTime iso={doc.created_at} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="px-8 py-4 text-[13px] text-ink-mute">
        {documents.length} {documents.length === 1 ? "document" : "documents"}
      </p>
    </div>
  );
}

const STATUS_STYLES: Record<DocumentStatus, { label: string; className: string }> = {
  QUEUED: { label: "Queued", className: "bg-canvas-soft text-ink-mute ring-hairline" },
  PROCESSING: { label: "Processing", className: "bg-primary-subdued/40 text-primary-deep ring-primary-subdued" },
  INDEXED: { label: "Indexed", className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
  FAILED: { label: "Failed", className: "bg-ruby/5 text-ruby ring-ruby/25" },
};

function StatusPill({ status }: { status: DocumentStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[12px] font-normal ring-1 ring-inset ${style.className}`}>
      {style.label}
    </span>
  );
}

function TableSkeleton() {
  return (
    <div aria-busy className="flex animate-pulse flex-col gap-3 px-8 pb-8">
      <div className="h-4 w-full rounded-[4px] bg-hairline" />
      <div className="h-4 w-11/12 rounded-[4px] bg-hairline" />
      <div className="h-4 w-4/5 rounded-[4px] bg-hairline" />
    </div>
  );
}
