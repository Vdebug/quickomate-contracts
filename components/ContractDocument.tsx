import { type Contract } from "@/lib/types";
import { formatDate } from "@/lib/util";

type Props = {
  contract: Contract;
  provider: { name: string; email: string };
  showStatus?: boolean;
};

export function ContractDocument({ contract, provider, showStatus = true }: Props) {
  const company = contract.client_company ?? contract.client_name;
  const firstName = contract.client_name.split(" ")[0];

  return (
    <div className="bg-[var(--qm-bg)] text-[var(--qm-ink)]">
      {/* === COVER === */}
      <header className="flex justify-between items-end border-b-2 border-[var(--qm-ink)] pb-6 mb-12 gap-6 flex-wrap">
        <div>
          <div className="qm-mono-label mb-1">Quickomate / Proposal</div>
          <h1 className="font-mono text-sm font-bold tracking-wide">
            // {contract.title.toUpperCase()}
          </h1>
        </div>
        <div className="qm-mono-label text-right leading-relaxed">
          <div>DOC: {contract.doc_number ?? "-"}</div>
          <div>
            DATE:{" "}
            {contract.effective_date
              ? formatDate(contract.effective_date)
              : formatDate(contract.created_at)}
          </div>
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
                  : contract.status === "viewed" || contract.status === "sent"
                  ? "AWAITING SIGNATURE"
                  : contract.status.toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </header>

      {contract.client_company && (
        <div className="qm-mono-label mb-3">
          // PREPARED FOR / {contract.client_company.toUpperCase()}
        </div>
      )}
      <div className="font-sans font-bold tracking-tight text-5xl md:text-6xl leading-[.95] mb-4 whitespace-pre-line">
        {contract.lede || contract.title}
      </div>
      <p className="font-serif text-xl md:text-2xl leading-snug text-[#222] max-w-[640px] mb-12">
        Scope of work, pricing, and terms for {contract.client_name}.
      </p>

      {/* === PARTIES === */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        <Party label="// FROM" name="Quickomate" sub={`${provider.name} · ${provider.email}`} />
        <Party
          label="// TO"
          name={company}
          sub={`${contract.client_name}${contract.client_title ? ", " + contract.client_title : ""} · ${contract.client_email}`}
        />
      </div>

      {/* === PERSONAL LETTER === */}
      {contract.letter && (
        <Section num="01 / LETTER" title={`Hi ${firstName},`}>
          <div className="font-serif text-lg leading-relaxed text-[#222] whitespace-pre-line max-w-[680px]">
            {contract.letter}
          </div>
          <p className="mt-6 text-base text-[#222]">
            Thanks,
            <br />
            <strong>{provider.name}</strong>
            <br />
            <span className="text-sm text-[#666]">{provider.email}</span>
          </p>
        </Section>
      )}

      {/* === PROBLEM === */}
      {(contract.problem?.title || contract.problem?.body) && (
        <Section num="02 / PROBLEM" title={contract.problem.title ?? `${company} suffers from a few core issues.`}>
          <div className="text-[15px] leading-relaxed whitespace-pre-line max-w-[680px]">
            {contract.problem.body}
          </div>
        </Section>
      )}

      {/* === SOLUTION === */}
      {contract.scope && (
        <Section num="03 / SOLUTION" title="My proposed solution to the problems above.">
          <p className="text-[15px] leading-relaxed max-w-[680px]">{contract.scope}</p>
        </Section>
      )}

      {/* === SCOPE OF WORK === */}
      {contract.deliverables.length > 0 && (
        <Section num="04 / SCOPE OF WORK" title={`Quickomate will build a system that fulfils the following:`}>
          <ul className="list-none border-t border-[var(--qm-ink)]">
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
          <p className="mt-6 text-sm text-[#444] max-w-[680px]">
            By taking a disciplined approach and remaining in constant contact with {firstName},
            I&rsquo;ll ensure delivery to spec and on schedule.
          </p>
        </Section>
      )}

      {/* === TIMELINE === */}
      {contract.timeline && contract.timeline.length > 0 && (
        <Section num="05 / TIMELINE" title="When you can expect what.">
          <ul className="list-none border-t border-[var(--qm-ink)]">
            {contract.timeline.map((t, i) => (
              <li
                key={i}
                className="py-3.5 border-b border-[#ccc] grid grid-cols-[64px_1fr] gap-4 items-baseline"
              >
                <span className="font-mono text-[11px] text-[var(--qm-accent)] font-bold uppercase">
                  {t.label}
                </span>
                <div className="text-[15px] leading-relaxed">{t.detail}</div>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-[#444] max-w-[680px]">
            This schedule reflects past experience designing similar systems. I always endeavor to
            deliver ahead of time, but this gives each step the energy it deserves.
          </p>
        </Section>
      )}

      {/* === RELATED SYSTEMS === */}
      {contract.related_systems && contract.related_systems.length > 0 && (
        <Section
          num="06 / RELATED SYSTEMS"
          title={contract.related_systems_title || "Other high-ROI systems Quickomate operates."}
        >
          <p className="text-sm text-[#444] mb-4 max-w-[680px]">
            {contract.related_systems_intro ||
              "In addition to the system proposed above, here are adjacent offerings clients commonly pair with this engagement."}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contract.related_systems.map((r, i) => (
              <div key={i} className="border border-[var(--qm-ink)] bg-[var(--qm-surface)] p-5">
                <div className="qm-mono-label mb-1.5">// {String(i + 1).padStart(2, "0")}</div>
                <h3 className="text-base font-bold tracking-tight mb-2">{r.title}</h3>
                <p className="text-sm text-[#222] leading-relaxed">{r.body}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* === YOUR INVESTMENT === */}
      {(contract.fees?.amount || contract.fees?.deposit) && (
        <Section num="07 / YOUR INVESTMENT" title="Pricing & terms.">
          <div className="bg-[var(--qm-ink)] text-[var(--qm-inverted)] p-8 grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            {contract.fees.amount && (
              <div>
                <div className="font-mono text-[11px] uppercase tracking-wider opacity-70 mb-1.5">
                  // Investment
                </div>
                <div className="text-3xl font-bold leading-tight">{contract.fees.amount}</div>
              </div>
            )}
            {contract.fees.deposit && (
              <div>
                <div className="font-mono text-[11px] uppercase tracking-wider opacity-70 mb-1.5">
                  // {contract.fees.deposit_label ?? "Due at signing"}
                </div>
                <div className="text-3xl font-bold leading-tight">{contract.fees.deposit}</div>
              </div>
            )}
          </div>
          <p className="text-sm text-[#444] max-w-[680px]">
            {contract.fees.notes ??
              "Delivery is defined as the fulfilment of the scope conditions above. Your payment is due upon full satisfaction with the project."}
          </p>
        </Section>
      )}

      {/* === TERMS (small, wrapped at the back) === */}
      {contract.terms.length > 0 && (
        <Section num="08 / TERMS" title="Operating terms.">
          <p className="text-sm text-[#444] mb-3 max-w-[680px]">
            Quickomate will build the system above for {company} per the scope laid out in
            this proposal. The terms below protect your confidentiality and streamline our
            information sharing. Questions? Email{" "}
            <a className="underline" href={`mailto:${provider.email}`}>
              {provider.email}
            </a>
            .
          </p>
          {contract.terms.map((c, i) => (
            <div key={i} className="border-t border-[#bbb] py-3">
              <h3 className="text-sm font-bold uppercase tracking-wide mb-1.5">{c.heading}</h3>
              <p className="text-sm text-[#222] leading-relaxed">{c.body}</p>
            </div>
          ))}
        </Section>
      )}

      {contract.custom_blocks && contract.custom_blocks.length > 0 && (
        <Section num="09 / ADDITIONAL" title="Additional terms.">
          {contract.custom_blocks.map((c, i) => (
            <div key={i} className="border-t border-[#bbb] py-3">
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
