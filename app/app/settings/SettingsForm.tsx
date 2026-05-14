"use client";

import { useEffect, useRef, useState } from "react";
import SignaturePad from "signature_pad";
import { saveSettings } from "./actions";

type Props = {
  defaultName: string;
  defaultEmail: string;
  signaturePreview: string | null;
};

export function SettingsForm({ defaultName, defaultEmail, signaturePreview }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePad | null>(null);
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [submitting, setSubmitting] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d")?.scale(ratio, ratio);
    const pad = new SignaturePad(canvas, {
      penColor: "#111111",
      backgroundColor: "rgba(0,0,0,0)",
      minWidth: 0.8,
      maxWidth: 2.2,
    });
    padRef.current = pad;
    return () => pad.off();
  }, []);

  const clearSig = () => padRef.current?.clear();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSavedMsg(null);
    setSubmitting(true);

    const pad = padRef.current;
    let signaturePng: string | null = null;
    if (pad && !pad.isEmpty()) {
      signaturePng = pad.toDataURL("image/png");
    }

    try {
      await saveSettings({
        display_name: name.trim(),
        display_email: email.trim(),
        signature_png: signaturePng,
      });
      setSavedMsg("Settings saved.");
      if (signaturePng) clearSig();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <section className="border-t border-[var(--qm-ink)] pt-6">
        <div className="qm-section-num mb-5">01 / IDENTITY</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="qm-mono-label block mb-1.5">// Display name</label>
            <input className="qm-input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="qm-mono-label block mb-1.5">// Display email (shown on contracts)</label>
            <input
              type="email"
              className="qm-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--qm-ink)] pt-6">
        <div className="qm-section-num mb-5">02 / SIGNATURE</div>

        {signaturePreview && (
          <div className="mb-5">
            <div className="qm-mono-label mb-1.5">// Current signature</div>
            <div className="border border-[var(--qm-ink)] bg-white p-4 max-w-[420px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={signaturePreview} alt="Current signature" style={{ maxHeight: 80 }} />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-1.5">
          <div className="qm-mono-label">// {signaturePreview ? "Replace signature" : "Draw signature"}</div>
          <button type="button" onClick={clearSig} className="qm-mono-label hover:text-[var(--qm-accent)] cursor-pointer">
            CLEAR
          </button>
        </div>
        <div className="border border-[var(--qm-ink)] bg-white h-[160px] relative max-w-[420px]">
          <canvas ref={canvasRef} className="w-full h-full touch-none" style={{ width: "100%", height: "100%" }} />
        </div>
        <p className="qm-mono-label mt-2">// LEAVE BLANK TO KEEP THE EXISTING SIGNATURE</p>
      </section>

      {error && (
        <div className="border border-[var(--qm-accent)] bg-[var(--qm-accent)]/10 px-4 py-3 text-sm text-[var(--qm-accent)]">
          {error}
        </div>
      )}
      {savedMsg && (
        <div className="border border-[var(--qm-ink)] bg-[var(--qm-surface)] px-4 py-3 text-sm">{savedMsg}</div>
      )}

      <div className="flex justify-end">
        <button type="submit" disabled={submitting} className="qm-btn-primary">
          {submitting ? "SAVING…" : "SAVE SETTINGS"} {submitting ? null : "→"}
        </button>
      </div>
    </form>
  );
}
