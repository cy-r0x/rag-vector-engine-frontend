import type { ReactNode } from "react";

import { GradientMesh } from "./gradient-mesh";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate flex min-h-full flex-1 flex-col overflow-hidden bg-canvas-soft font-light text-ink">
      <GradientMesh />
      <main className="flex flex-1 items-center justify-center px-4 py-12">{children}</main>
    </div>
  );
}
