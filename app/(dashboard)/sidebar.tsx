"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore, type ReactNode } from "react";

import { logout } from "@/app/actions/auth";

const STORAGE_KEY = "sidebar-collapsed";
const CHANGE_EVENT = "sidebar-collapsed-change";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function useCollapsed(): [boolean, (collapsed: boolean) => void] {
  const collapsed = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(STORAGE_KEY) === "1",
    () => false,
  );
  const setCollapsed = (value: boolean) => {
    localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
    window.dispatchEvent(new Event(CHANGE_EVENT));
  };
  return [collapsed, setCollapsed];
}

type NavItem = { href: string; label: string; icon: ReactNode; exact?: boolean };

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Overview", icon: <HomeIcon />, exact: true },
  { href: "/documents", label: "Documents", icon: <DocumentIcon /> },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useCollapsed();

  return (
    <aside
      id="dashboard-sidebar"
      className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-hairline bg-canvas transition-[width] duration-200 ${
        collapsed ? "w-[72px]" : "w-60"
      }`}
    >
      <div className={`flex h-16 items-center gap-3 px-4 ${collapsed ? "justify-center" : "justify-between"}`}>
        {!collapsed && (
          <Link href="/" className="truncate text-base font-normal tracking-[-0.2px] text-ink">
            RAG Vector Engine
          </Link>
        )}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          aria-controls="dashboard-sidebar"
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand menu" : "Collapse menu"}
          title={collapsed ? "Expand menu" : "Collapse menu"}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-[8px] text-ink-mute transition-colors hover:bg-canvas-soft hover:text-ink focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
        >
          <ChevronIcon className={`transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </div>

      <nav aria-label="Main" className="flex flex-1 flex-col gap-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              title={collapsed ? item.label : undefined}
              className={`flex h-10 items-center gap-3 rounded-[8px] px-3 text-[15px] transition-colors ${
                collapsed ? "justify-center" : ""
              } ${
                active
                  ? "bg-primary/8 font-normal text-primary"
                  : "text-ink-secondary hover:bg-canvas-soft hover:text-ink"
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              <span className={collapsed ? "sr-only" : "truncate"}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <form action={logout} className="border-t border-hairline px-3 py-4">
        <button
          type="submit"
          title={collapsed ? "Sign out" : undefined}
          className={`flex h-10 w-full items-center gap-3 rounded-[8px] px-3 text-[15px] text-ink-secondary transition-colors hover:bg-canvas-soft hover:text-ink focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <span className="shrink-0">
            <SignOutIcon />
          </span>
          <span className={collapsed ? "sr-only" : "truncate"}>Sign out</span>
        </button>
      </form>
    </aside>
  );
}

function Icon({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`size-5 ${className}`}
    >
      {children}
    </svg>
  );
}

function HomeIcon() {
  return (
    <Icon>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M10 21v-6h4v6" />
    </Icon>
  );
}

function DocumentIcon() {
  return (
    <Icon>
      <path d="M14 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V8z" />
      <path d="M14 3v5h5" />
      <path d="M8.5 13h7M8.5 16.5h5" />
    </Icon>
  );
}

function SignOutIcon() {
  return (
    <Icon>
      <path d="M15 4h3.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H15" />
      <path d="M10 16.5 5.5 12 10 7.5" />
      <path d="M5.5 12H15" />
    </Icon>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <path d="m14.5 6-6 6 6 6" />
    </Icon>
  );
}
