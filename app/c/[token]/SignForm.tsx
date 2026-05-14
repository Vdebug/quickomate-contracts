"use client";

import { useEffect, useRef, useState } from "react";
import SignaturePad from "signature_pad";
import { useRouter } from "next/navigation";

export function SignForm({ token }: { token: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePad | null>(null);
  const [typedName, setTypedName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Initialise + resize signature pad
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

    const pad = padRef.current;
    if (!pad || pad.isEmpty()) {
      setError("Please draw your signature.");
      return;
    }
    if (!typedName.trim()) {
      setError("Please type your full legal name.");
      return;
    }
    if (!agreed) {
      setError("Please confirm you agree to the terms.");
      return;
    }

    setSubmitting(true);
    try {
      const signaturePng = pad.toDataURL("image/png");
      const res = await fetch("/api/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, typed_name: typedName.trim(), signature_png: signaturePng }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Submission failed");
      }
      router.push(`/c/${token}/thanks`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mt-16 border-t-2 border-[var(--qm-ink)] pt-8">
      <h2 className="text-3xl md:text-[32px] font-bold mb-2">Sign &amp; Submit</h2>
      <p className="font-serif text-lg text-[#333] mb-6">
        By signing below, you agree to the terms of this Service Agreement.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="qm-mono-label block mb-1.5" htmlFor="typed-name">
            // Full legal name
          </label>
          <input
            id="typed-name"
            className="qm-input"
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            placeholder="Jane Doe"
            autoComplete="name"
            required
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="qm-mono-label">// Signature (draw)</label>
            <button
              type="button"
              onClick={clearSig}
              className="qm-mono-label hover:text-[var(--qm-accent)] cursor-pointer"
            >
              CLEAR
            </button>
          </div>
          <div className="border border-[var(--qm-ink)] bg-white h-[140px] relative">
            <canvas
              ref={canvasRef}
              className="w-full h-full touch-none"
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </div>
      </div>

      <label className="flex items-start gap-3 mb-6 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-1"
        />
        <span className="text-sm text-[#222] leading-relaxed">
          I have read and agree to the terms of this Service Agreement. I understand my
          signature is legally binding.
        </span>
      </label>

      {error && (
        <div className="mb-4 border border-[var(--qm-accent)] bg-[var(--qm-accent)]/10 px-4 py-3 text-sm text-[var(--qm-accent)]">
          {error}
        </div>
      )}

      <button type="submit" disabled={submitting} className="qm-btn-primary">
        {submitting ? "SUBMITTING…" : "SIGN & SUBMIT"} {submitting ? null : "→"}
      </button>
    </form>
  );
}
