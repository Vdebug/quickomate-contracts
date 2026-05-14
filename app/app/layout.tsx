import Link from "next/link";
import { LogoutButton } from "./LogoutButton";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--qm-ink)] bg-[var(--qm-bg)]">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <Link href="/app" className="flex items-center gap-3 no-underline text-[var(--qm-ink)]">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--qm-muted)]">
              // QUICKOMATE
            </span>
            <span className="font-bold tracking-tight text-lg">CONTRACTS</span>
          </Link>
          <nav className="flex items-center gap-5 text-sm">
            <Link href="/app" className="hover:text-[var(--qm-accent)] no-underline text-[var(--qm-ink)]">
              Dashboard
            </Link>
            <Link href="/app/contracts/new" className="hover:text-[var(--qm-accent)] no-underline text-[var(--qm-ink)]">
              New contract
            </Link>
            <Link href="/app/settings" className="hover:text-[var(--qm-accent)] no-underline text-[var(--qm-ink)]">
              Settings
            </Link>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <div className="flex-1">{children}</div>
      <footer className="border-t border-[var(--qm-ink)] py-4 px-6">
        <div className="max-w-[1200px] mx-auto flex justify-between gap-4 flex-wrap">
          <div className="qm-mono-label">QUICKOMATE / CONTRACT OPS</div>
          <div className="qm-mono-label">QUICKOMATE.COM</div>
        </div>
      </footer>
    </div>
  );
}
