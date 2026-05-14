"use client";

import { useState } from "react";
import { createContract, type ContractInput } from "./actions";

const defaultDeliverables: ContractInput["deliverables"] = [
  { label: "ICP & offer audit", detail: "Diagnose the current funnel and the gap between offer and audience." },
  { label: "Cold email infrastructure", detail: "Set up domains, inboxes, warm-up, and deliverability monitoring." },
  { label: "Custom AI agents", detail: "Build personalization, reply triage, and booking automation tailored to your GTM." },
  { label: "Performance reviews", detail: "Monthly review of pipeline, reply rates, and qualified appointment volume." },
];

const defaultTimeline: ContractInput["timeline"] = [
  { label: "Week 1", detail: "Onboarding, ICP audit, infrastructure setup, copy drafted." },
  { label: "Week 2", detail: "Inbox warm-up running; first AI agents shipped; campaign ready." },
  { label: "Week 3-4", detail: "Launch to first segment; tune deliverability and reply handling." },
  { label: "Ongoing", detail: "Weekly iteration on copy + targeting; monthly performance review." },
];

const defaultRelated: ContractInput["related_systems"] = [
  { title: "Lead sourcing & cold outreach", body: "High-ROI cold outreach that routinely generates 15–20× return on spend. We source, write, send, and iterate on proven campaigns and deliver qualified meetings to your inbox." },
  { title: "AI-personalized reply handling", body: "Custom agents triage replies, draft responses in your voice, and book meetings, keeping your inbox clear without dropping warm leads." },
  { title: "Inbound infrastructure", body: "Landing pages, lead magnets, and CRM hooks to convert traffic into pipeline once outbound creates demand." },
  { title: "Content engine", body: "LinkedIn + email content systems that compound brand and inbound over 3–6 months." },
];

const defaultTerms: ContractInput["terms"] = [
  {
    heading: "Confidentiality",
    body: "Both parties agree to keep all materials, data, and strategy shared during the engagement strictly confidential.",
  },
  {
    heading: "Ownership",
    body: "Client owns all systems, lists, and IP produced during the engagement. Quickomate retains rights to internal frameworks, templates, and methodologies.",
  },
  {
    heading: "Termination",
    body: "Either party may terminate with 14 days written notice.",
  },
];

export function ContractForm() {
  const [form, setForm] = useState<ContractInput>({
    title: "Service Agreement",
    effective_date: new Date().toISOString().slice(0, 10),
    client_name: "",
    client_email: "",
    client_company: "",
    client_title: "",
    letter:
      "I spent some time boiling down our conversation into what I believe to be the core of the opportunity in front of you. The proposal below lays out the problem as I understood it, the system I'd build to fix it, the timeline you can expect, and what it will cost.\n\nI'm confident I can do an outstanding job here, if I wasn't, I wouldn't have put this together.",
    problem: {
      title: "",
      body: "",
    },
    scope:
      "Quickomate will design, build, and operate an end-to-end outbound growth system, ICP research, cold email infrastructure, custom AI agents for personalization, and ongoing performance optimization. Target: 15–20 qualified appointments per month within 60 days.",
    deliverables: defaultDeliverables,
    timeline: defaultTimeline,
    related_systems: defaultRelated,
    fees: {
      amount: "$8,500",
      deposit: "$4,250",
      deposit_label: "Due at signing",
      notes: "50% due at signing, 50% on completion. Delivery is the fulfilment of the scope above; payment is due upon full satisfaction with the project.",
    },
    terms: defaultTerms,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof ContractInput>(k: K, v: ContractInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const addItem = <K extends "deliverables" | "timeline">(k: K, blank: ContractInput[K][number]) =>
    set(k, [...form[k], blank] as ContractInput[K]);
  const updateItem = <K extends "deliverables" | "timeline">(k: K, i: number, patch: Partial<ContractInput[K][number]>) =>
    set(k, form[k].map((x, idx) => (idx === i ? { ...x, ...patch } : x)) as ContractInput[K]);
  const removeItem = <K extends "deliverables" | "timeline">(k: K, i: number) =>
    set(k, form[k].filter((_, idx) => idx !== i) as ContractInput[K]);

  const addRelated = () => set("related_systems", [...form.related_systems, { title: "", body: "" }]);
  const updateRelated = (i: number, patch: Partial<ContractInput["related_systems"][number]>) =>
    set("related_systems", form.related_systems.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const removeRelated = (i: number) =>
    set("related_systems", form.related_systems.filter((_, idx) => idx !== i));

  const addClause = () => set("terms", [...form.terms, { heading: "", body: "" }]);
  const updateClause = (i: number, patch: Partial<ContractInput["terms"][number]>) =>
    set("terms", form.terms.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  const removeClause = (i: number) =>
    set("terms", form.terms.filter((_, idx) => idx !== i));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createContract(form);
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
            <input className="qm-input" value={form.client_name} onChange={(e) => set("client_name", e.target.value)} required placeholder="Jane Doe" />
          </Field>
          <Field label="// Client email">
            <input type="email" className="qm-input" value={form.client_email} onChange={(e) => set("client_email", e.target.value)} required placeholder="jane@acme.com" />
          </Field>
          <Field label="// Company">
            <input className="qm-input" value={form.client_company ?? ""} onChange={(e) => set("client_company", e.target.value)} placeholder="Acme Industries" />
          </Field>
          <Field label="// Title">
            <input className="qm-input" value={form.client_title ?? ""} onChange={(e) => set("client_title", e.target.value)} placeholder="Head of Growth" />
          </Field>
        </Grid>
      </FormSection>

      <FormSection num="02 / PROPOSAL META">
        <Grid>
          <Field label="// Title">
            <input className="qm-input" value={form.title} onChange={(e) => set("title", e.target.value)} required />
          </Field>
          <Field label="// Effective date">
            <input type="date" className="qm-input" value={form.effective_date ?? ""} onChange={(e) => set("effective_date", e.target.value)} />
          </Field>
        </Grid>
      </FormSection>

      <FormSection num="03 / PERSONAL LETTER">
        <p className="text-sm text-[var(--qm-muted)] mb-2">
          Opens the proposal in your voice. Talk like a human, not a brand. First-person works best.
        </p>
        <Field label="// Letter body (signed as you)">
          <textarea className="qm-input" rows={6} value={form.letter ?? ""} onChange={(e) => set("letter", e.target.value)} />
        </Field>
      </FormSection>

      <FormSection num="04 / PROBLEM">
        <p className="text-sm text-[var(--qm-muted)] mb-2">
          Restate the problem in your client&rsquo;s words. This is where personalization earns trust.
        </p>
        <Field label="// Problem title">
          <input
            className="qm-input"
            placeholder="e.g. Acme suffers from a stalled pipeline and stale lists."
            value={form.problem.title ?? ""}
            onChange={(e) => set("problem", { ...form.problem, title: e.target.value })}
          />
        </Field>
        <Field label="// Problem body (3-4 bulleted pains works well, use newlines)">
          <textarea
            className="qm-input"
            rows={5}
            placeholder="• Cold email volume is flat\n• Reply rate dropping below 1%\n• Sales team out of qualified meetings"
            value={form.problem.body ?? ""}
            onChange={(e) => set("problem", { ...form.problem, body: e.target.value })}
          />
        </Field>
      </FormSection>

      <FormSection num="05 / SOLUTION">
        <p className="text-sm text-[var(--qm-muted)] mb-2">
          Confident framing of what you&rsquo;ll do. One paragraph.
        </p>
        <Field label="// Solution body">
          <textarea className="qm-input" rows={4} value={form.scope ?? ""} onChange={(e) => set("scope", e.target.value)} />
        </Field>
      </FormSection>

      <FormSection num="06 / SCOPE OF WORK">
        <div className="space-y-3">
          {form.deliverables.map((d, i) => (
            <div key={i} className="grid grid-cols-[40px_1fr_2fr_60px] gap-3 items-start">
              <div className="qm-mono-label pt-3">{String(i + 1).padStart(2, "0")}</div>
              <input className="qm-input" placeholder="Label" value={d.label} onChange={(e) => updateItem("deliverables", i, { label: e.target.value })} />
              <input className="qm-input" placeholder="Detail (optional)" value={d.detail ?? ""} onChange={(e) => updateItem("deliverables", i, { detail: e.target.value })} />
              <button type="button" onClick={() => removeItem("deliverables", i)} className="qm-mono-label hover:text-[var(--qm-accent)] cursor-pointer text-left pt-3">REMOVE</button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => addItem("deliverables", { label: "", detail: "" })} className="qm-btn-ghost mt-4">+ ADD DELIVERABLE</button>
      </FormSection>

      <FormSection num="07 / TIMELINE">
        <div className="space-y-3">
          {form.timeline.map((t, i) => (
            <div key={i} className="grid grid-cols-[110px_2fr_60px] gap-3 items-start">
              <input className="qm-input" placeholder="Week 1" value={t.label} onChange={(e) => updateItem("timeline", i, { label: e.target.value })} />
              <input className="qm-input" placeholder="What happens this period" value={t.detail ?? ""} onChange={(e) => updateItem("timeline", i, { detail: e.target.value })} />
              <button type="button" onClick={() => removeItem("timeline", i)} className="qm-mono-label hover:text-[var(--qm-accent)] cursor-pointer text-left pt-3">REMOVE</button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => addItem("timeline", { label: "", detail: "" })} className="qm-btn-ghost mt-4">+ ADD TIMELINE ITEM</button>
      </FormSection>

      <FormSection num="08 / RELATED SYSTEMS">
        <p className="text-sm text-[var(--qm-muted)] mb-3">
          Adjacent offerings, sets up upsell opportunities without selling them now.
        </p>
        <div className="space-y-3">
          {form.related_systems.map((r, i) => (
            <div key={i} className="border border-[var(--qm-ink)]/40 p-4 bg-[var(--qm-surface)]/30 space-y-2">
              <div className="flex items-center justify-between">
                <input className="qm-input flex-1 mr-3" placeholder="System title" value={r.title} onChange={(e) => updateRelated(i, { title: e.target.value })} />
                <button type="button" onClick={() => removeRelated(i)} className="qm-mono-label hover:text-[var(--qm-accent)] cursor-pointer">REMOVE</button>
              </div>
              <textarea className="qm-input" rows={2} placeholder="One or two sentences describing it" value={r.body} onChange={(e) => updateRelated(i, { body: e.target.value })} />
            </div>
          ))}
        </div>
        <button type="button" onClick={addRelated} className="qm-btn-ghost mt-4">+ ADD RELATED SYSTEM</button>
      </FormSection>

      <FormSection num="09 / YOUR INVESTMENT">
        <Grid>
          <Field label="// Total investment">
            <input className="qm-input" value={form.fees.amount ?? ""} onChange={(e) => set("fees", { ...form.fees, amount: e.target.value })} placeholder="$8,500" />
          </Field>
          <Field label="// Deposit amount">
            <input className="qm-input" value={form.fees.deposit ?? ""} onChange={(e) => set("fees", { ...form.fees, deposit: e.target.value })} placeholder="$4,250" />
          </Field>
          <Field label="// Deposit label">
            <input className="qm-input" value={form.fees.deposit_label ?? ""} onChange={(e) => set("fees", { ...form.fees, deposit_label: e.target.value })} placeholder="Due at signing" />
          </Field>
          <Field label="// Reassurance note">
            <input className="qm-input" value={form.fees.notes ?? ""} onChange={(e) => set("fees", { ...form.fees, notes: e.target.value })} />
          </Field>
        </Grid>
      </FormSection>

      <FormSection num="10 / OPERATING TERMS">
        <p className="text-sm text-[var(--qm-muted)] mb-3">
          Kept short and tucked at the back. Confidentiality + ownership + termination is usually enough.
        </p>
        <div className="space-y-3">
          {form.terms.map((c, i) => (
            <div key={i} className="border border-[var(--qm-ink)]/40 p-4 grid grid-cols-1 gap-2 bg-[var(--qm-surface)]/30">
              <div className="flex items-center justify-between">
                <input className="qm-input flex-1 mr-3" placeholder="Clause heading" value={c.heading} onChange={(e) => updateClause(i, { heading: e.target.value })} />
                <button type="button" onClick={() => removeClause(i)} className="qm-mono-label hover:text-[var(--qm-accent)] cursor-pointer">REMOVE</button>
              </div>
              <textarea className="qm-input" rows={3} placeholder="Clause body" value={c.body} onChange={(e) => updateClause(i, { body: e.target.value })} />
            </div>
          ))}
        </div>
        <button type="button" onClick={addClause} className="qm-btn-ghost mt-4">+ ADD CLAUSE</button>
      </FormSection>

      {error && (
        <div className="border border-[var(--qm-accent)] bg-[var(--qm-accent)]/10 px-4 py-3 text-sm text-[var(--qm-accent)]">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3 items-center">
        <p className="qm-mono-label mr-2">// NEXT: PREVIEW BEFORE SENDING</p>
        <button type="submit" disabled={submitting} className="qm-btn-primary">
          {submitting ? "SAVING…" : "PREVIEW PROPOSAL"} {submitting ? null : "→"}
        </button>
      </div>
    </form>
  );
}

function FormSection({ num, children }: { num: string; children: React.ReactNode }) {
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
