import type { ReactNode } from "react";

import { Sidebar } from "./sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 bg-canvas-soft font-light text-ink">
      <Sidebar />
      <main className="min-w-0 flex-1 px-6 py-10 lg:px-10">
        <div className="mx-auto w-full max-w-[1100px]">{children}</div>
      </main>
    </div>
  );
}
