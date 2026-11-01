import type { DocumentStatus } from "@/lib/documents";

const STATUS_STYLES: Record<DocumentStatus, { label: string; className: string }> = {
  QUEUED: { label: "Queued", className: "bg-canvas-soft text-ink-mute ring-hairline" },
  PROCESSING: { label: "Processing", className: "bg-primary-subdued/40 text-primary-deep ring-primary-subdued" },
  INDEXED: { label: "Indexed", className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
  FAILED: { label: "Failed", className: "bg-ruby/5 text-ruby ring-ruby/25" },
};

export function StatusPill({ status }: { status: DocumentStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[12px] font-normal ring-1 ring-inset ${style.className}`}>
      {style.label}
    </span>
  );
}
