"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type DragEvent } from "react";

import {
  ACCEPTED_FILE_TYPES,
  formatBytes,
  mimeLabel,
  UPLOAD_LIMITS,
  type UploadRejection,
} from "@/lib/documents";

type StagedFile = { key: string; file: File; error?: string };
type Notice = { tone: "success" | "error"; message: string };

const ACCEPT = ACCEPTED_FILE_TYPES.map((type) => type.extension).join(",");
const TYPE_LABELS = ACCEPTED_FILE_TYPES.map((type) => type.label).join(", ");

function fileKey(file: File) {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

function checkFile(file: File): string | undefined {
  const dot = file.name.lastIndexOf(".");
  const extension = dot === -1 ? "" : file.name.slice(dot).toLowerCase();
  if (!ACCEPTED_FILE_TYPES.some((type) => type.extension === extension)) {
    return `Unsupported file type. Allowed: ${TYPE_LABELS}.`;
  }
  if (file.size === 0) return "File is empty.";
  if (file.size > UPLOAD_LIMITS.maxFileBytes) {
    return `File is larger than the ${formatBytes(UPLOAD_LIMITS.maxFileBytes)} limit.`;
  }
  return undefined;
}

function checkBatch(files: StagedFile[]): string | undefined {
  if (files.length > UPLOAD_LIMITS.maxFiles) {
    return `You can upload at most ${UPLOAD_LIMITS.maxFiles} files at a time.`;
  }
  const total = files.reduce((sum, item) => sum + item.file.size, 0);
  if (total > UPLOAD_LIMITS.maxBatchBytes) {
    return `Total size ${formatBytes(total)} exceeds the ${formatBytes(UPLOAD_LIMITS.maxBatchBytes)} limit per upload.`;
  }
  return undefined;
}

function sendUpload(files: File[], onProgress: (fraction: number) => void) {
  return new Promise<{ status: number; body: unknown }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/documents/upload");
    xhr.responseType = "json";
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    };
    xhr.onload = () => resolve({ status: xhr.status, body: xhr.response });
    xhr.onerror = () => reject(new Error("Network error"));

    const form = new FormData();
    for (const file of files) form.append("files", file, file.name);
    xhr.send(form);
  });
}

export function DocumentUploader() {
  const router = useRouter();
  const inputId = useId();
  const [staged, setStaged] = useState<StagedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [notice, setNotice] = useState<Notice | null>(null);

  const batchError = checkBatch(staged);
  const hasFileErrors = staged.some((item) => item.error);
  const totalBytes = staged.reduce((sum, item) => sum + item.file.size, 0);
  const canUpload = staged.length > 0 && !batchError && !hasFileErrors && !uploading;

  function addFiles(list: FileList | null) {
    // Copy now: a FileList is live and clearing the input empties it before the state updater runs.
    const files = Array.from(list ?? []);
    if (files.length === 0) return;
    setNotice(null);
    setStaged((current) => {
      const seen = new Set(current.map((item) => item.key));
      const added = files
        .filter((file) => !seen.has(fileKey(file)))
        .map((file) => ({ key: fileKey(file), file, error: checkFile(file) }));
      return [...current, ...added];
    });
  }

  function removeFile(key: string) {
    setStaged((current) => current.filter((item) => item.key !== key));
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    if (!uploading) addFiles(event.dataTransfer.files);
  }

  async function upload() {
    if (!canUpload) return;
    setUploading(true);
    setProgress(0);
    setNotice(null);

    try {
      const { status, body } = await sendUpload(
        staged.map((item) => item.file),
        setProgress,
      );
      const payload = (body ?? {}) as { detail?: unknown; errors?: UploadRejection[]; documents?: unknown[] };

      if (status === 201) {
        const count = payload.documents?.length ?? staged.length;
        setStaged([]);
        setNotice({ tone: "success", message: `Uploaded ${count} ${count === 1 ? "document" : "documents"}.` });
        router.refresh();
        return;
      }

      if (payload.errors?.length) {
        const rejections = new Map(payload.errors.map((error) => [error.index, error]));
        setStaged((current) =>
          current.map((item, index) => {
            const rejection = rejections.get(index);
            if (!rejection) return item;
            const detected = rejection.detected_mime ? ` (detected ${mimeLabel(rejection.detected_mime)})` : "";
            return { ...item, error: `${rejection.detail}${detected}` };
          }),
        );
      }
      const detail = typeof payload.detail === "string" ? payload.detail : `Upload failed (HTTP ${status}).`;
      setNotice({ tone: "error", message: detail });
    } catch {
      setNotice({ tone: "error", message: "Upload failed: can't reach the server. Please try again." });
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="rounded-[12px] border border-hairline bg-canvas p-8 shadow-level-1">
      <h2 className="text-[22px] leading-[1.1] font-light tracking-[-0.22px] text-ink">Upload documents</h2>
      <p className="mt-2 text-[15px] text-ink-mute">
        Files are verified by their content on the server; a batch is stored only if every file passes.
      </p>

      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault();
          if (!uploading) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`mt-6 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[12px] border border-dashed px-6 py-10 text-center transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 ${
          dragging ? "border-primary bg-primary/5" : "border-hairline-input bg-canvas-soft hover:border-primary/60"
        } ${uploading ? "pointer-events-none opacity-60" : ""}`}
      >
        <UploadIcon />
        <span className="text-[15px] text-ink">
          Drag files here or <span className="font-normal text-primary">browse</span>
        </span>
        <span className="text-[13px] tracking-[-0.39px] text-ink-mute">
          {TYPE_LABELS} · up to {formatBytes(UPLOAD_LIMITS.maxFileBytes)} each · {UPLOAD_LIMITS.maxFiles} files and{" "}
          {formatBytes(UPLOAD_LIMITS.maxBatchBytes)} per upload
        </span>
        <input
          id={inputId}
          type="file"
          multiple
          accept={ACCEPT}
          disabled={uploading}
          className="sr-only"
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </label>

      {notice && (
        <div
          role={notice.tone === "error" ? "alert" : "status"}
          className={`mt-6 rounded-[8px] border px-3 py-2.5 text-[14px] font-normal ${
            notice.tone === "error"
              ? "border-ruby/25 bg-ruby/5 text-ruby"
              : "border-emerald-600/20 bg-emerald-50 text-emerald-700"
          }`}
        >
          {notice.message}
        </div>
      )}

      {staged.length > 0 && (
        <div className="mt-6">
          <ul className="divide-y divide-hairline rounded-[8px] border border-hairline">
            {staged.map((item) => (
              <li key={item.key} className="flex items-center gap-4 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] text-ink">{item.file.name}</p>
                  <p
                    className={`text-[13px] tracking-[-0.39px] [font-feature-settings:'tnum'] ${
                      item.error ? "text-ruby" : "text-ink-mute"
                    }`}
                  >
                    {item.error ?? formatBytes(item.file.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(item.key)}
                  disabled={uploading}
                  aria-label={`Remove ${item.file.name}`}
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-[6px] text-ink-mute transition-colors hover:bg-canvas-soft hover:text-ink disabled:opacity-50"
                >
                  <CloseIcon />
                </button>
              </li>
            ))}
          </ul>

          {batchError && (
            <p role="alert" className="mt-3 text-[13px] tracking-[-0.39px] text-ruby">
              {batchError}
            </p>
          )}

          {uploading && (
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-hairline" aria-hidden>
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-150"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[13px] tracking-[-0.39px] text-ink-mute [font-feature-settings:'tnum']">
              {staged.length} {staged.length === 1 ? "file" : "files"} · {formatBytes(totalBytes)}
              {uploading && ` · ${Math.round(progress * 100)}% sent`}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setStaged([]);
                  setNotice(null);
                }}
                disabled={uploading}
                className="inline-flex h-10 items-center rounded-full border border-primary bg-canvas px-4 py-2 text-sm leading-none font-normal text-primary transition-colors hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={upload}
                disabled={!canUpload}
                className="inline-flex h-10 items-center rounded-full bg-primary px-4 py-2 text-sm leading-none font-normal text-white transition-colors hover:bg-primary-deep active:bg-primary-press disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploading
                  ? "Uploading…"
                  : `Upload ${staged.length} ${staged.length === 1 ? "file" : "files"}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function UploadIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-8 text-primary"
    >
      <path d="M12 15V4" />
      <path d="m7.5 8.5 4.5-4.5 4.5 4.5" />
      <path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-4">
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}
