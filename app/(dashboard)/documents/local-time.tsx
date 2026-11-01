"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

export function LocalTime({ iso }: { iso: string }) {
  const isClient = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const date = new Date(iso);
  const label = isClient
    ? date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : `${date.toISOString().slice(0, 16).replace("T", " ")} UTC`;

  return <time dateTime={iso}>{label}</time>;
}
