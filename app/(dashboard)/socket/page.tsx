import type { Metadata } from "next";
import { Suspense } from "react";

import { getJson } from "@/lib/api";
import { requireAccessToken } from "@/lib/session";
import type { SocketInfo } from "@/lib/socket";

import { PageHeader } from "../page-header";
import { IntegrationGuide } from "./integration-guide";
import { SocketTokenPanel } from "./socket-token-panel";

export const metadata: Metadata = {
  title: "Socket access",
};

export default function SocketPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Socket"
        title="Socket access"
        description="Connect your own backend to your business's chat socket with a static token."
      />
      <Suspense fallback={<PanelSkeleton />}>
        <SocketAccess />
      </Suspense>
    </div>
  );
}

async function SocketAccess() {
  const token = await requireAccessToken();
  const result = await getJson<SocketInfo>("/v1/socket", token);
  if (!result.ok) {
    return (
      <p role="alert" className="rounded-[8px] border border-ruby/25 bg-ruby/5 px-4 py-3 text-[14px] text-ruby">
        Couldn&apos;t load socket access: {result.detail}
      </p>
    );
  }
  return (
    <>
      <SocketTokenPanel info={result.data} />
      <IntegrationGuide wsUrl={result.data.ws_url} />
    </>
  );
}

function PanelSkeleton() {
  return (
    <div aria-busy className="h-56 animate-pulse rounded-[12px] border border-hairline bg-canvas shadow-level-1" />
  );
}
