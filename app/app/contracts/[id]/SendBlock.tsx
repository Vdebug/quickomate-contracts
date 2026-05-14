"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ContractStatus } from "@/lib/types";

type Props = {
  contractId: string;
  status: ContractStatus;
  clientEmail: string;
  shareUrl: string;
  adminEmail: string;
};

export function SendBlock({ contractId, status, clientEmail, shareUrl, adminEmail }: Props) {
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const send = async () => {
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/contracts/${contractId}/send`, { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to send");
      }
      setConfirming(false);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="border border-[var(--qm-ink)] bg-[var(--qm-bg)]">
      <div className="px-4 py-3 border-b border-[var(--qm-ink)] bg-[var(--qm-surface)]">
        <div className="qm-mono-label">// ACTIONS</div>
      </div>
      <div className="p-4 space-y-3">
        {status === "draft" && !confirming && (
          <button onClick={() => setConfirming(true)} className="qm-btn-primary w-full justify-center">
            SEND CONTRACT →
          </button>
        )}

        {status === "draft" && confirming && (
          <div className="space-y-3">
            <div className="border border-[var(--qm-ink)] bg-[var(--qm-surface)] p-3 space-y-1.5">
              <div className="qm-mono-label">// CONFIRM SEND</div>
              <p className="text-sm">
                Email the contract to <strong>{clientEmail}</strong>
                <br />
                <span className="text-[var(--qm-muted)]">A copy will also be sent to you at {adminEmail}.</span>
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={send} disabled={sending} className="qm-btn-primary flex-1 justify-center">
                {sending ? "SENDING…" : "CONFIRM"} {sending ? null : "→"}
              </button>
              <button
                onClick={() => setConfirming(false)}
                disabled={sending}
                className="qm-btn-ghost"
              >
                CANCEL
              </button>
            </div>
          </div>
        )}

        {(status === "sent" || status === "viewed") && (
          <>
            <p className="text-sm text-[#333]">
              Sent to <strong>{clientEmail}</strong>
              {" — "}awaiting signature.
            </p>
            <button onClick={send} disabled={sending} className="qm-btn-ghost w-full justify-center">
              {sending ? "RESENDING…" : "RESEND EMAIL"}
            </button>
          </>
        )}

        {status === "signed" && (
          <>
            <p className="text-sm text-[#333]">Signed. PDF emailed to both parties.</p>
            <a
              href={`/api/contracts/${contractId}/pdf`}
              className="qm-btn-primary w-full justify-center no-underline text-center"
            >
              DOWNLOAD PDF →
            </a>
          </>
        )}

        <div className="pt-2 border-t border-[#ddd]">
          <div className="qm-mono-label mb-1.5">// SHARE LINK</div>
          <div className="flex gap-2">
            <input readOnly value={shareUrl} className="qm-input flex-1 font-mono text-xs" />
            <button onClick={onCopy} type="button" className="qm-btn-ghost px-3 text-xs">
              {copied ? "COPIED" : "COPY"}
            </button>
          </div>
        </div>

        {error && (
          <div className="border border-[var(--qm-accent)] bg-[var(--qm-accent)]/10 px-3 py-2 text-sm text-[var(--qm-accent)]">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
