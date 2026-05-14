import { type Contract } from "@/lib/types";
import { formatDate } from "@/lib/util";

type Props = {
  contract: Contract;
  provider: { name: string; email: string };
  showStatus?: boolean;
};

export function ContractDocument({ contract, provider, showStatus = true }: Props) {
  return (
    <div className="bg-[var(--qm-bg)] text-[var(--qm-ink)]">
      <header className="flex justify-between items-end border-b-2 border-[var(--qm-ink)] pb-6 mb-12 gap-6 flex-wrap">
        <div>
          <div className="qm-mono-label mb-1">Quickomate / Contract</div>
          <h1 className="font-mono text-sm font-bold tracking-wide">
            // {contract.title.toUpperCase()}
          </h1>
        </div>
        <div className="qm-mono-label text-right leading-relaxed">
          <div>DOC: {contract.doc_number ?? "—"}</div>
          <div>
            DATE:{" "}
            {contract.effective_date
              ? formatDate(contract.effective_date)
              : formatDate(contract.created_at)}
          </div>
          <div>VERSION: 1.0</div>
          {showStatus && (
            <div className="inline-flex items-center gap-2 bg-[var(--qm-surface)] border border-[var(--qm-ink)] px-2.5 py-1 mt-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  contract.status === "signed" ? "bg-[var(--qm-ink)]" : "bg-[var(--qm-accent)]"
                }`}
              />
              <span>
                {contract.status === "signed"
                  ? "SIGNED"
                  : contract.status === "viewed"
                  ? "AWAITING SIGNATURE"
                  : contract.status === "sent"
                  ? "AWAITING SIGNATURE"
                  : contract.status.toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </header>

      <div className="font-sans font-bold tracking-tight text-5xl md:text-6xl leading-[.95] mb-4">
        Build growth
        <br />
        that compounds.
      </div>
      {contract.lede && (
        <p className="font-serif text-xl md:text-2xl leading-snug text-[#222] max-w-[640px] mb-12">
          {contract.lede}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        <Party label="// Provider" name="Quickomate" sub={`${provider.name} · ${provider.email}`} />
        <Party
          label="// Client"
          name={contract.client_company ?? contract.client_name}
          sub={`${contract.client_name}${contract.client_title ? ", " + contract.client_title : ""} · ${contract.client_email}`}
        />
      </div>

      {contract.scope && (
        <Section num="01 / SCOPE" title="What we're building">
          <p className="text-[15px] leading-relaxed">{contract.scope}</p>
        </Section>
      )}

      {contract.deliverables.length > 0 && (
        <Section num="02 / DELIVERABLES" title="What you get">
          <ul className="list-none border-t border-[var(--qm-ink)]" style={{ counterReset: "d" }}>
            {contract.deliverables.map((d, i) => (
              <li
                key={i}
                className="py-3.5 border-b border-[#ccc] grid grid-cols-[32px_1fr] gap-4 items-baseline"
              >
                <span className="font-mono text-[11px] text-[var(--qm-accent)] font-bold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="text-[15px] leading-relaxed">
                  <strong>{d.label}.</strong>
                  {d.detail ? <> {d.detail}</> : null}
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {(contract.fees.amount || contract.fees.term) && (
        <Section num="03 / FEES & TERM" title="Commercials">
          <div className="bg-[var(--qm-ink)] text-[var(--qm-inverted)] p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {contract.fees.amount && (
              <div>
                <div className="font-mono text-[11px] uppercase tracking-wider opacity-70 mb-1.5">
                  // Engagement fee
                </div>
                <div className="text-3xl font-bold leading-tight">{contract.fees.amount}</div>
              </div>
            )}
            {contract.fees.term && (
              <div>
                <div className="font-mono text-[11px] uppercase tracking-wider opacity-70 mb-1.5">
                  // Term
                </div>
                <div className="text-3xl font-bold leading-tight">{contract.fees.term}</div>
              </div>
            )}
          </div>
          {contract.fees.notes && (
            <p className="mt-4 text-sm text-[#444]">{contract.fees.notes}</p>
          )}
        </Section>
      )}

      {contract.terms.length > 0 && (
        <Section num="04 / TERMS" title="Operating terms">
          {contract.terms.map((c, i) => (
            <div key={i} className="border-t border-[#bbb] py-4">
              <h3 className="text-sm font-bold uppercase tracking-wide mb-1.5">{c.heading}</h3>
              <p className="text-sm text-[#222] leading-relaxed">{c.body}</p>
            </div>
          ))}
        </Section>
      )}

      {contract.custom_blocks.length > 0 && (
        <Section num="05 / ADDITIONAL" title="Additional terms">
          {contract.custom_blocks.map((c, i) => (
            <div key={i} className="border-t border-[#bbb] py-4">
              <h3 className="text-sm font-bold uppercase tracking-wide mb-1.5">{c.heading}</h3>
              <p className="text-sm text-[#222] leading-relaxed">{c.body}</p>
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

function Party({ label, name, sub }: { label: string; name: string; sub: string }) {
  return (
    <div className="bg-[var(--qm-surface)] border border-[var(--qm-ink)] p-6">
      <div className="qm-mono-label mb-2">{label}</div>
      <div className="text-xl font-bold mb-1">{name}</div>
      <div className="text-sm text-[#444]">{sub}</div>
    </div>
  );
}

function Section({
  num,
  title,
  children,
}: {
  num: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12">
      <span className="qm-section-num block mb-2">{num}</span>
      <h2 className="text-2xl md:text-[28px] font-bold mb-4 tracking-tight">{title}</h2>
      {children}
    </section>
  );
}
