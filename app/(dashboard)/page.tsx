import type { Metadata } from "next";
import { Suspense } from "react";

import { requireSession } from "@/lib/session";

import { PageHeader } from "./page-header";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Overview"
        title="Welcome back"
        description="Your workspace for ingesting business documents and querying them."
      />

      <Suspense fallback={<AccountCardSkeleton />}>
        <AccountCard />
      </Suspense>
    </div>
  );
}

async function AccountCard() {
  const session = await requireSession();

  return (
    <section className="max-w-[640px] rounded-[12px] border border-hairline bg-canvas p-8 shadow-level-1">
      <h2 className="text-[22px] leading-[1.1] font-light tracking-[-0.22px] text-ink">Account</h2>
      <dl className="mt-6 grid gap-4 text-[14px] leading-[1.4] tracking-[-0.42px] [font-feature-settings:'tnum'] sm:grid-cols-[160px_1fr]">
        <dt className="text-[13px] font-normal text-ink-mute">Business ID</dt>
        <dd className="font-mono break-all text-ink-secondary">{session.businessId}</dd>
        <dt className="text-[13px] font-normal text-ink-mute">User ID</dt>
        <dd className="font-mono break-all text-ink-secondary">{session.userId}</dd>
      </dl>
    </section>
  );
}

function AccountCardSkeleton() {
  return (
    <section
      aria-busy
      className="max-w-[640px] animate-pulse rounded-[12px] border border-hairline bg-canvas p-8 shadow-level-1"
    >
      <div className="h-6 w-28 rounded-[4px] bg-hairline" />
      <div className="mt-6 flex flex-col gap-4">
        <div className="h-4 w-full rounded-[4px] bg-hairline" />
        <div className="h-4 w-5/6 rounded-[4px] bg-hairline" />
      </div>
    </section>
  );
}
