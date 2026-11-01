import type { Metadata } from "next";

import { PageHeader } from "../page-header";
import { ChatPanel } from "./chat-panel";

export const metadata: Metadata = {
  title: "Chat",
};

export default function ChatPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Chat"
        title="Ask your documents"
        description="Answers come only from your business's indexed documents, with the sources they're based on."
      />
      <ChatPanel />
    </div>
  );
}
