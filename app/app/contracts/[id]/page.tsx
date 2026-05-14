import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { ContractDocument } from "@/components/ContractDocument";
import { SendBlock } from "./SendBlock";
import { formatDate, formatDateTimeUTC } from "@/lib/util";
import type { Contract } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ContractDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("contracts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) notFound();
  const contract = data as Contract;

  const providerName = process.env.NEXT_PUBLIC_PROVIDER_NAME ?? "Vasu Gupta";
  const providerEmail = process.env.NEXT_PUBLIC_PROVIDER_EMAIL ?? "vasu@quickomate.com";

  const { data: events } = await supabase
    .from("contract_events")
    .select("event_type, created_at, metadata")
    .eq("contract_id", id)
    .order("created_at", { ascending: false })
    .limit(20);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const shareUrl = `${baseUrl}/c/${contract.share_token}`;

  const isDraft = contract.status === "draft";

  return (
    <main className="max-w-[1200px] mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
      <div>
        <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="qm-mono-label mb-1">// {contract.doc_number ?? "-"}</div>
            <h1 className="text-3xl font-bold tracking-tight">{contract.client_company ?? contract.client_name}</h1>
            <p className="qm-mono-label mt-1">STATUS: {contract.status.toUpperCase()}</p>
          </div>
          <Link href="/app" className="qm-mono-label hover:text-[var(--qm-accent)] no-underline">
            ← BACK
          </Link>
        </div>

        {isDraft && (
          <div className="mb-4 border border-[var(--qm-accent)] bg-[var(--qm-accent)]/10 px-4 py-3 text-sm flex items-center gap-3">
            <span className="qm-mono-label text-[var(--qm-accent)]">// PREVIEW</span>
            <span className="text-[var(--qm-ink)]">
              This is exactly what your client will see. Hit <strong>Send</strong> on the right when ready.
            </span>
          </div>
        )}

        <div className="border border-[var(--qm-ink)] bg-[var(--qm-bg)] p-8 md:p-12">
          <ContractDocument contract={contract} provider={{ name: providerName, email: providerEmail }} showStatus={false} />
        </div>
      </div>

      <aside className="space-y-6 lg:sticky lg:top-6 self-start">
        <SendBlock
          contractId={contract.id}
          status={contract.status}
          clientEmail={contract.client_email}
          shareUrl={shareUrl}
          adminEmail={providerEmail}
        />

        <div className="border border-[var(--qm-ink)] bg-[var(--qm-bg)]">
          <div className="px-4 py-3 border-b border-[var(--qm-ink)] bg-[var(--qm-surface)]">
            <div className="qm-mono-label">// METADATA</div>
          </div>
          <div className="px-4 py-4 space-y-2 font-mono text-[11px] text-[#222]">
            <Meta k="DOC" v={contract.doc_number ?? "-"} />
            <Meta k="STATUS" v={contract.status.toUpperCase()} />
            <Meta k="CREATED" v={formatDate(contract.created_at)} />
            <Meta k="SENT" v={contract.sent_at ? formatDateTimeUTC(contract.sent_at) : "-"} />
            <Meta k="VIEWED" v={contract.viewed_at ? formatDateTimeUTC(contract.viewed_at) : "-"} />
            <Meta k="SIGNED" v={contract.signed_at ? formatDateTimeUTC(contract.signed_at) : "-"} />
            <Meta k="SIGNER_IP" v={contract.signer_ip ?? "-"} />
          </div>
        </div>

        <div className="border border-[var(--qm-ink)] bg-[var(--qm-bg)]">
          <div className="px-4 py-3 border-b border-[var(--qm-ink)] bg-[var(--qm-surface)]">
            <div className="qm-mono-label">// AUDIT LOG</div>
          </div>
          <div className="px-4 py-4 space-y-2 font-mono text-[11px] text-[#222]">
            {(events ?? []).length === 0 && <div className="text-[var(--qm-muted)]">No events yet.</div>}
            {(events ?? []).map((e, i) => (
              <div key={i} className="flex justify-between gap-2">
                <span className="text-[var(--qm-accent)]">{e.event_type.toUpperCase()}</span>
                <span className="text-[var(--qm-muted)]">{formatDateTimeUTC(e.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </main>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-[var(--qm-muted)]">{k}:</span>
      <span className="text-right break-all">{v}</span>
    </div>
  );
}
