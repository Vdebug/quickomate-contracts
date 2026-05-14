"use client";

import { useState } from "react";
import { createContract, type ContractInput } from "./actions";

const defaultTerms: ContractInput["terms"] = [
  {
    heading: "Confidentiality",
    body: "Both parties agree to keep all materials, data, and strategy shared during the engagement strictly confidential.",
  },
  {
    heading: "Ownership",
    body: "Client owns all systems, lists, and IP produced during the engagement. Quickomate retains rights to internal frameworks.",
  },
  {
    heading: "Termination",
    body: "Either party may terminate with 14 days written notice. Fees are pro-rated to termination date.",
  },
];

const defaultDeliverables: ContractInput["deliverables"] = [
  { label: "ICP & offer audit", detail: "Diagnostic of your current funnel + recommendations." },
  { label: "Cold email infrastructure", detail: "Domains, inboxes, warm-up, deliverability monitoring." },
  { label: "Custom AI agents", detail: "Personalization, reply triage, booking automation." },
  { label: "Monthly performance reviews", detail: "Pipeline, reply rates, appointment volume." },
];

export function ContractForm() {
  const [form, setForm] = useState<ContractInput>({
    title: "Service Agreement",
    effective_date: new Date().toISOString().slice(0, 10),
    client_name: "",
    client_email: "",
    client_company: "",
    client_title: "",
    lede: "This agreement defines the engagement between Quickomate and the Client for AI-powered growth infrastructure, lead generation systems, and revenue execution.",
    scope:
      "Quickomate will design, build, and operate an end-to-end outbound growth system — including ICP research, cold email infrastructure, custom AI agents for personalization, and ongoing performance optimization.",
    deliverables: defaultDeliverables,
    fees: { amount: "$8,500/mo", term: "3 months, no retainer", notes: "" },
    terms: defaultTerms,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof ContractInput>(k: K, v: ContractInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const addDeliverable = () =>
    set("deliverables", [...form.deliverables, { label: "", detail: "" }]);
  const updateDeliverable = (i: number, patch: Partial<ContractInput["deliverables"][number]>) =>
    set(
      "deliverables",
      form.deliverables.map((d, idx) => (idx === i ? { ...d, ...patch } : d))
    );
  const removeDeliverable = (i: number) =>
    set("deliverables", form.deliverables.filter((_, idx) => idx !== i));

  const addClause = () => set("terms", [...form.terms, { heading: "", body: "" }]);
  const updateClause = (i: number, patch: Partial<ContractInput["terms"][number]>) =>
    set(
      "terms",
      form.terms.map((c, idx) => (idx === i ? { ...c, ...patch } : c))
    );
  const removeClause = (i: number) =>
    set("terms", form.terms.filter((_, idx) => idx !== i));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createContract(form);
      // redirect happens in server action
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-12">
      <FormSection num="01 / CLIENT">
        <Grid>
          <Field label="// Client name">
            <input
              className="qm-input"
              value={form.client_name}
              onChange={(e) => set("client_name", e.target.value)}
              required
              placeholder="Jane Doe"
            />
          </Field>
          <Field label="// Client email">
            <input
              type="email"
              className="qm-input"
              value={form.client_email}
              onChange={(e) => set("client_email", e.target.value)}
              required
              placeholder="jane@acme.com"
            />
          </Field>
          <Field label="// Company">
            <input
              className="qm-input"
              value={form.client_company ?? ""}
              onChange={(e) => set("client_company", e.target.value)}
              placeholder="Acme Industries"
            />
          </Field>
          <Field label="// Title">
            <input
              className="qm-input"
              value={form.client_title ?? ""}
              onChange={(e) => set("client_title", e.target.value)}
              placeholder="Head of Growth"
            />
          </Field>
        </Grid>
      </FormSection>

      <FormSection num="02 / CONTRACT">
        <Grid>
          <Field label="// Title">
            <input
              className="qm-input"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              required
            />
          </Field>
          <Field label="// Effective date">
            <input
              type="date"
              className="qm-input"
              value={form.effective_date ?? ""}
              onChange={(e) => set("effective_date", e.target.value)}
            />
          </Field>
        </Grid>
        <Field label="// Lede (one-line introduction)">
          <textarea
            className="qm-input"
            rows={2}
            value={form.lede ?? ""}
            onChange={(e) => set("lede", e.target.value)}
          />
        </Field>
      </FormSection>

      <FormSection num="03 / SCOPE">
        <Field label="// What you'll build / matters discussed">
          <textarea
            className="qm-input"
            rows={5}
            value={form.scope ?? ""}
            onChange={(e) => set("scope", e.target.value)}
          />
        </Field>
      </FormSection>

      <FormSection num="04 / DELIVERABLES">
        <div className="space-y-3">
          {form.deliverables.map((d, i) => (
            <div key={i} className="grid grid-cols-[40px_1fr_2fr_60px] gap-3 items-start">
              <div className="qm-mono-label pt-3">{String(i + 1).padStart(2, "0")}</div>
              <input
                className="qm-input"
                placeholder="Label"
                value={d.label}
                onChange={(e) => updateDeliverable(i, { label: e.target.value })}
              />
              <input
                className="qm-input"
                placeholder="Detail (optional)"
                value={d.detail ?? ""}
                onChange={(e) => updateDeliverable(i, { detail: e.target.value })}
              />
              <button
                type="button"
                onClick={() => removeDeliverable(i)}
                className="qm-mono-label hover:text-[var(--qm-accent)] cursor-pointer text-left pt-3"
              >
                REMOVE
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addDeliverable} className="qm-btn-ghost mt-4">
          + ADD DELIVERABLE
        </button>
      </FormSection>

      <FormSection num="05 / FEES & TERM">
        <Grid>
          <Field label="// Engagement fee">
            <input
              className="qm-input"
              value={form.fees.amount ?? ""}
              onChange={(e) => set("fees", { ...form.fees, amount: e.target.value })}
              placeholder="$8,500/mo"
            />
          </Field>
          <Field label="// Term">
            <input
              className="qm-input"
              value={form.fees.term ?? ""}
              onChange={(e) => set("fees", { ...form.fees, term: e.target.value })}
              placeholder="3 months, no retainer"
            />
          </Field>
        </Grid>
        <Field label="// Notes (optional)">
          <input
            className="qm-input"
            value={form.fees.notes ?? ""}
            onChange={(e) => set("fees", { ...form.fees, notes: e.target.value })}
          />
        </Field>
      </FormSection>

      <FormSection num="06 / OPERATING TERMS">
        <div className="space-y-3">
          {form.terms.map((c, i) => (
            <div
              key={i}
              className="border border-[var(--qm-ink)]/40 p-4 grid grid-cols-1 gap-2 bg-[var(--qm-surface)]/30"
            >
              <div className="flex items-center justify-between">
                <input
                  className="qm-input flex-1 mr-3"
                  placeholder="Clause heading"
                  value={c.heading}
                  onChange={(e) => updateClause(i, { heading: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => removeClause(i)}
                  className="qm-mono-label hover:text-[var(--qm-accent)] cursor-pointer"
                >
                  REMOVE
                </button>
              </div>
              <textarea
                className="qm-input"
                rows={3}
                placeholder="Clause body"
                value={c.body}
                onChange={(e) => updateClause(i, { body: e.target.value })}
              />
            </div>
          ))}
        </div>
        <button type="button" onClick={addClause} className="qm-btn-ghost mt-4">
          + ADD CLAUSE
        </button>
      </FormSection>

      {error && (
        <div className="border border-[var(--qm-accent)] bg-[var(--qm-accent)]/10 px-4 py-3 text-sm text-[var(--qm-accent)]">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3 items-center">
        <p className="qm-mono-label mr-2">// NEXT: PREVIEW BEFORE SENDING</p>
        <button type="submit" disabled={submitting} className="qm-btn-primary">
          {submitting ? "SAVING…" : "PREVIEW CONTRACT"} {submitting ? null : "→"}
        </button>
      </div>
    </form>
  );
}

function FormSection({
  num,
  children,
}: {
  num: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-[var(--qm-ink)] pt-6">
      <div className="qm-section-num mb-5">{num}</div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="qm-mono-label block mb-1.5">{label}</label>
      {children}
    </div>
  );
}
