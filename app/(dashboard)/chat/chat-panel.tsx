"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { createChatConnection } from "@/app/actions/chat";

import { markdownComponents } from "../markdown-components";

const MAX_QUERY_CHARS = 2000;
const CLOSE_UNAUTHORIZED = 4401;
const CLOSE_FORBIDDEN = 4403;

type Source = {
  number: number;
  doc_id: string;
  filename: string;
  chunk_index: number;
  score: number;
  excerpt: string;
};

type Frame =
  | { type: "delta"; content: string; session_id?: string }
  | { type: "done"; sources: Source[]; session_id?: string }
  | { type: "error"; detail: string; session_id?: string };

type Message =
  | { id: string; role: "user"; content: string }
  | { id: string; role: "assistant"; content: string; sources: Source[]; pending: boolean; error?: string };

type Status = "connecting" | "open" | "closed";

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<Status>("connecting");
  const [notice, setNotice] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const socketRef = useRef<WebSocket | null>(null);
  const sessionIdRef = useRef<string>("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const pending = messages.some((message) => message.role === "assistant" && message.pending);

  const updateLastAnswer = useCallback((update: (message: Extract<Message, { role: "assistant" }>) => Message) => {
    setMessages((current) => {
      const index = current.findLastIndex((message) => message.role === "assistant");
      if (index === -1) return current;
      const next = [...current];
      next[index] = update(current[index] as Extract<Message, { role: "assistant" }>);
      return next;
    });
  }, []);

  const connect = useCallback(async () => {
    socketRef.current?.close();
    setStatus("connecting");
    setNotice(null);

    const connection = await createChatConnection();
    if (!connection.ok) {
      setStatus("closed");
      setNotice(`Couldn't start the chat: ${connection.detail}`);
      return;
    }

    const socket = new WebSocket(connection.url);
    socketRef.current = socket;
    socket.onopen = () => {
      if (socketRef.current === socket) setStatus("open");
    };
    socket.onmessage = (event) => {
      const frame = JSON.parse(event.data as string) as Frame;
      if (frame.type === "delta") {
        updateLastAnswer((message) => ({ ...message, content: message.content + frame.content }));
      } else if (frame.type === "done") {
        updateLastAnswer((message) => ({ ...message, sources: frame.sources, pending: false }));
      } else {
        updateLastAnswer((message) => ({ ...message, error: frame.detail, pending: false }));
      }
    };
    socket.onclose = (event) => {
      if (socketRef.current !== socket) return;
      socketRef.current = null;
      setStatus("closed");
      updateLastAnswer((message) =>
        message.pending ? { ...message, pending: false, error: "The connection closed before the answer finished." } : message,
      );
      if (event.code === CLOSE_UNAUTHORIZED) setNotice("Your session has expired. Please sign in again.");
      else if (event.code === CLOSE_FORBIDDEN) setNotice("This chat belongs to another business.");
      else setNotice("Disconnected from the chat server.");
    };
  }, [updateLastAnswer]);

  useEffect(() => {
    sessionIdRef.current = crypto.randomUUID();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- opening the socket is the effect; state follows it
    void connect();
    return () => {
      const socket = socketRef.current;
      socketRef.current = null;
      socket?.close();
    };
  }, [connect]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages]);

  function send(event?: FormEvent) {
    event?.preventDefault();
    const query = draft.trim();
    const socket = socketRef.current;
    if (!query || pending || !socket || socket.readyState !== WebSocket.OPEN) return;

    const id = crypto.randomUUID();
    setMessages((current) => [
      ...current,
      { id: `${id}-q`, role: "user", content: query },
      { id: `${id}-a`, role: "assistant", content: "", sources: [], pending: true },
    ]);
    setDraft("");
    socket.send(JSON.stringify({ query, session_id: sessionIdRef.current }));
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send();
    }
  }

  return (
    <section className="flex h-[calc(100vh-260px)] min-h-[460px] flex-col rounded-[12px] border border-hairline bg-canvas shadow-level-1">
      <div className="flex items-center justify-between gap-3 border-b border-hairline px-6 py-3">
        <ConnectionBadge status={status} />
        {status === "closed" && (
          <button
            type="button"
            onClick={() => void connect()}
            className="inline-flex h-8 items-center rounded-full border border-primary bg-canvas px-3 text-[13px] leading-none font-normal text-primary transition-colors hover:bg-primary/5"
          >
            Reconnect
          </button>
        )}
      </div>

      {notice && (
        <div role="status" className="border-b border-hairline bg-canvas-soft px-6 py-2.5 text-[14px] text-ink-secondary">
          {notice}
          {notice.startsWith("Your session") && (
            <>
              {" "}
              <Link href="/login" className="font-normal text-primary hover:text-primary-deep">
                Sign in
              </Link>
            </>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-6 py-6" aria-live="polite">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <p className="text-[18px] font-light text-ink">Ask anything about your documents</p>
            <p className="max-w-md text-[14px] text-ink-mute">
              For example: &ldquo;What was revenue growth last quarter?&rdquo; Only indexed documents are searched.
            </p>
          </div>
        ) : (
          <ol className="flex flex-col gap-6">
            {messages.map((message) => (
              <li key={message.id} className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
                {message.role === "user" ? (
                  <p className="max-w-[80%] rounded-[12px] bg-primary px-4 py-2.5 text-[15px] leading-[1.5] whitespace-pre-wrap text-white">
                    {message.content}
                  </p>
                ) : (
                  <AssistantMessage message={message} />
                )}
              </li>
            ))}
          </ol>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="border-t border-hairline p-4">
        <div className="flex items-end gap-3 rounded-[12px] border border-hairline-input bg-canvas px-3 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
          <label htmlFor="chat-query" className="sr-only">
            Your question
          </label>
          <textarea
            id="chat-query"
            rows={1}
            value={draft}
            maxLength={MAX_QUERY_CHARS}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder={status === "open" ? "Ask a question…" : "Connecting…"}
            disabled={status !== "open"}
            className="max-h-40 min-h-[36px] flex-1 resize-none bg-transparent py-1.5 text-[15px] leading-[1.5] font-light text-ink outline-none placeholder:text-ink-mute/70 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={status !== "open" || pending || !draft.trim()}
            className="inline-flex h-9 shrink-0 items-center rounded-full bg-primary px-4 text-sm leading-none font-normal text-white transition-colors hover:bg-primary-deep active:bg-primary-press disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Answering…" : "Send"}
          </button>
        </div>
        <p className="mt-2 text-right text-[12px] text-ink-mute [font-feature-settings:'tnum']">
          Enter to send · Shift+Enter for a new line · {draft.length}/{MAX_QUERY_CHARS}
        </p>
      </form>
    </section>
  );
}

function AssistantMessage({ message }: { message: Extract<Message, { role: "assistant" }> }) {
  return (
    <div className="w-full max-w-[90%]">
      <div className="rounded-[12px] border border-hairline bg-canvas-soft px-5 py-3">
        {message.content ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {message.content}
          </ReactMarkdown>
        ) : message.pending ? (
          <p className="animate-pulse text-[15px] text-ink-mute">Searching your documents…</p>
        ) : null}
        {message.error && <p className="mt-2 text-[14px] text-ruby">{message.error}</p>}
      </div>
      {message.sources.length > 0 && (
        <div className="mt-2">
          <p className="text-[12px] font-normal tracking-[0.1px] text-ink-mute uppercase">Sources</p>
          <ul className="mt-1 flex flex-col gap-1">
            {message.sources.map((source) => (
              <li key={`${source.doc_id}-${source.chunk_index}`}>
                <details className="group text-[13px]">
                  <summary className="cursor-pointer list-none text-ink-secondary marker:hidden">
                    <span className="text-ink-mute">[{source.number}]</span>{" "}
                    <Link href={`/documents/${source.doc_id}`} className="font-normal text-primary hover:text-primary-deep">
                      {source.filename}
                    </Link>{" "}
                    <span className="text-ink-mute [font-feature-settings:'tnum']">
                      · {Math.round(source.score * 100)}% match · <span className="group-open:hidden">show excerpt</span>
                      <span className="hidden group-open:inline">hide excerpt</span>
                    </span>
                  </summary>
                  <p className="mt-1 ml-6 border-l-2 border-primary-subdued pl-3 whitespace-pre-wrap text-ink-mute">
                    {source.excerpt}
                  </p>
                </details>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ConnectionBadge({ status }: { status: Status }) {
  const styles: Record<Status, { label: string; dot: string }> = {
    connecting: { label: "Connecting…", dot: "bg-primary-subdued animate-pulse" },
    open: { label: "Connected", dot: "bg-emerald-500" },
    closed: { label: "Disconnected", dot: "bg-ruby" },
  };
  return (
    <span className="inline-flex items-center gap-2 text-[13px] text-ink-secondary">
      <span aria-hidden className={`size-2 rounded-full ${styles[status].dot}`} />
      {styles[status].label}
    </span>
  );
}
