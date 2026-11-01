export type DocumentStatus = "QUEUED" | "PROCESSING" | "INDEXED" | "FAILED";

export type DocumentSummary = {
  doc_id: string;
  filename: string;
  status: DocumentStatus;
  detected_mime: string;
  size_bytes: number;
  created_at: string;
  updated_at: string;
};

export type UploadRejection = {
  index: number;
  filename: string;
  detail: string;
  detected_mime: string | null;
};

/** Mirrors the backend defaults (MAX_UPLOAD_FILES, MAX_UPLOAD_BYTES, MAX_BATCH_BYTES); the backend stays authoritative. */
export const UPLOAD_LIMITS = {
  maxFiles: 50,
  maxFileBytes: 25 * 1024 * 1024,
  maxBatchBytes: 200 * 1024 * 1024,
};

export const ACCEPTED_FILE_TYPES = [
  { extension: ".pdf", label: "PDF" },
  { extension: ".docx", label: "DOCX" },
  { extension: ".xlsx", label: "XLSX" },
  { extension: ".csv", label: "CSV" },
  { extension: ".txt", label: "TXT" },
] as const;

const MIME_LABELS: Record<string, string> = {
  "application/pdf": "PDF",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
  "text/csv": "CSV",
  "text/plain": "TXT",
};

export function mimeLabel(mime: string): string {
  return MIME_LABELS[mime] ?? mime;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unit]}`;
}
