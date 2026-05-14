import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/util";
import type { ContractStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const statusLabel: Record<ContractStatus, string> = {
  draft: "DRAFT",
  sent: "SENT",
  viewed: "VIEWED",
  signed: "SIGNED",
  declined: "DECLINED",
  expired: "EXPIRED",
};

const statusColor: Record<ContractStatus, string> = {
  draft: "bg-[var(--qm-surface)] text-[var(--qm-ink)]",
  sent: "bg-[var(--qm-ink)] text-[var(--qm-inverted)]",
  viewed: "bg-[var(--qm-ink)] text-[var(--qm-inverted)]",
  signed: "bg-[var(--qm-accent)] text-white",
  declined: "bg-[var(--qm-surface)] text-[var(--qm-ink)]",
  expired: "bg-[var(--qm-surface)] text-[var(--qm-ink)]",
};

export default async function Dashboard() {
  const supabase = createAdminClient();
  const { data: contracts } = await supabase
    .from("contracts")
    .select("id, doc_number, title, client_name, client_company, client_email, status, created_at, signed_at")
    .order("created_at", { ascending: false });

  const counts = (contracts ?? []).reduce(
    (acc: Record<string, number>, c: { status: string }) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <main className="max-w-[1200px] mx-auto px-6 py-12">
      <div className="flex items-end justify-between mb-12 gap-4 flex-wrap">
        <div>
          <div className="qm-mono-label mb-2">// QUICKOMATE / DASHBOARD</div>
          <h1 className="text-5xl font-bold tracking-tight leading-[.95]">Contracts.</h1>
        </div>
        <Link href="/app/contracts/new" className="qm-btn-primary no-underline">
          + NEW CONTRACT
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
        <StatCard label="Total" value={contracts?.length ?? 0} />
        <StatCard label="Sent" value={(counts.sent ?? 0) + (counts.viewed ?? 0)} />
        <StatCard label="Signed" value={counts.signed ?? 0} accent />
        <StatCard label="Draft" value={counts.draft ?? 0} />
      </div>

      <div className="border border-[var(--qm-ink)] bg-[var(--qm-bg)]">
        <div className="grid grid-cols-[110px_1fr_1fr_120px_140px] gap-4 px-5 py-3 border-b border-[var(--qm-ink)] bg-[var(--qm-surface)]">
          <div className="qm-mono-label">DOC</div>
          <div className="qm-mono-label">CLIENT</div>
          <div className="qm-mono-label">TITLE</div>
          <div className="qm-mono-label">STATUS</div>
          <div className="qm-mono-label">CREATED</div>
        </div>
        {(contracts ?? []).length === 0 && (
          <div className="px-5 py-16 text-center">
            <p className="font-serif text-xl text-[#444] mb-4">No contracts yet.</p>
            <Link href="/app/contracts/new" className="qm-btn-ghost no-underline inline-block">
              CREATE YOUR FIRST CONTRACT →
            </Link>
          </div>
        )}
        {(contracts ?? []).map((c) => (
          <Link
            key={c.id}
            href={`/app/contracts/${c.id}`}
            className="grid grid-cols-[110px_1fr_1fr_120px_140px] gap-4 px-5 py-4 border-b border-[#ccc] last:border-b-0 items-center text-sm no-underline text-[var(--qm-ink)] hover:bg-[var(--qm-surface)] transition"
          >
            <div className="font-mono text-xs text-[var(--qm-muted)]">{c.doc_number ?? "—"}</div>
            <div>
              <div className="font-semibold">{c.client_company ?? c.client_name}</div>
              <div className="text-xs text-[#666]">{c.client_email}</div>
            </div>
            <div className="text-[#333]">{c.title}</div>
            <div>
              <span
                className={`inline-block font-mono text-[10px] px-2 py-1 tracking-wider ${
                  statusColor[c.status as ContractStatus]
                }`}
              >
                {statusLabel[c.status as ContractStatus]}
              </span>
            </div>
            <div className="font-mono text-xs text-[var(--qm-muted)]">
              {formatDate(c.created_at)}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div
      className={`border border-[var(--qm-ink)] p-5 ${
        accent ? "bg-[var(--qm-ink)] text-[var(--qm-inverted)]" : "bg-[var(--qm-surface)]"
      }`}
    >
      <div
        className={`font-mono text-[10px] uppercase tracking-wider mb-2 ${
          accent ? "opacity-70" : "text-[var(--qm-muted)]"
        }`}
      >
        // {label}
      </div>
      <div className="text-3xl font-bold leading-none">{value}</div>
    </div>
  );
}
