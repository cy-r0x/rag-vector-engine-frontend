"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { issueSocketToken } from "@/app/actions/socket";
import type { IssuedSocketToken, SocketInfo } from "@/lib/socket";

import { LocalTime } from "../documents/local-time";
import { CopyButton } from "./copy-button";

export function SocketTokenPanel({ info }: { info: SocketInfo }) {
  const router = useRouter();
  const [issued, setIssued] = useState<IssuedSocketToken | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const current = issued ? { prefix: issued.prefix, created_at: issued.created_at } : info.token;

  function issue() {
    setError(null);
    startTransition(async () => {
      const result = await issueSocketToken();
      if (!result.ok) {
        setError(result.detail);
        return;
      }
      setIssued(result.issued);
      setConfirming(false);
      router.refresh();
    });
  }

  return (
    <section className="flex flex-col gap-6 rounded-[12px] border border-hairline bg-canvas p-8 shadow-level-1">
      <div>
        <h2 className="text-[22px] leading-[1.1] font-light tracking-[-0.22px] text-ink">Socket URL</h2>
        <p className="mt-2 text-[15px] text-ink-mute">Your backend opens a WebSocket to this address.</p>
        <div className="mt-4 flex items-center gap-3 rounded-[8px] border border-hairline bg-canvas-soft px-4 py-3">
          <code className="min-w-0 flex-1 truncate font-mono text-[13px] text-ink-secondary" title={info.ws_url}>
            {info.ws_url}
          </code>
          <CopyButton value={info.ws_url} />
        </div>
      </div>

      <div className="border-t border-hairline pt-6">
        <h2 className="text-[22px] leading-[1.1] font-light tracking-[-0.22px] text-ink">Socket token</h2>
        <p className="mt-2 text-[15px] text-ink-mute">
          A static token for server-to-server use. Keep it in your backend&apos;s secrets; never ship it to browsers or
          apps.
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-[8px] border border-hairline px-4 py-3">
          {current ? (
            <p className="text-[14px] text-ink-secondary [font-feature-settings:'tnum']">
              <code className="font-mono text-[13px] text-ink">{current.prefix}…</code>
              <span className="text-ink-mute">
                {" "}
                · created <LocalTime iso={current.created_at} />
              </span>
            </p>
          ) : (
            <p className="text-[14px] text-ink-mute">No token yet.</p>
          )}

          {!confirming ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => (current ? setConfirming(true) : issue())}
              className="inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm leading-none font-normal text-white transition-colors hover:bg-primary-deep active:bg-primary-press disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Generating…" : current ? "Rotate token" : "Generate token"}
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[13px] text-ruby">The current token stops working immediately.</span>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={pending}
                className="inline-flex h-9 items-center rounded-full border border-primary bg-canvas px-4 text-sm leading-none font-normal text-primary transition-colors hover:bg-primary/5 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={issue}
                disabled={pending}
                className="inline-flex h-9 items-center rounded-full bg-ruby px-4 text-sm leading-none font-normal text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {pending ? "Rotating…" : "Rotate now"}
              </button>
            </div>
          )}
        </div>

        {error && (
          <p role="alert" className="mt-3 text-[14px] text-ruby">
            {error}
          </p>
        )}

        {issued && (
          <div role="status" className="mt-4 rounded-[8px] border border-emerald-600/25 bg-emerald-50 p-4">
            <p className="text-[14px] font-normal text-emerald-800">
              Copy your new token now. For your security it won&apos;t be shown again.
            </p>
            <div className="mt-3 flex items-center gap-3 rounded-[8px] border border-emerald-600/20 bg-canvas px-4 py-3">
              <code className="min-w-0 flex-1 font-mono text-[13px] break-all text-ink">{issued.token}</code>
              <CopyButton value={issued.token} label="Copy token" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
