import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function ThanksPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("contracts")
    .select("id, client_name, signed_at, signed_pdf_path, status")
    .eq("share_token", token)
    .maybeSingle();
  if (!data) notFound();

  return (
    <main className="min-h-screen flex flex-col">
      <div className="max-w-[700px] mx-auto px-6 md:px-14 py-24 flex-1">
        <div className="qm-mono-label mb-3">// QUICKOMATE / CONTRACT SIGNED</div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[.95] mb-4">
          Thanks, {data.client_name.split(" ")[0]}.
        </h1>
        <p className="font-serif text-2xl text-[#333] leading-snug mb-8">
          Your agreement is signed and a copy has been emailed to you.
        </p>

        <div className="border border-[var(--qm-ink)] bg-[var(--qm-surface)] p-6 mb-8">
          <div className="qm-mono-label mb-2">// SUMMARY</div>
          <div className="font-mono text-sm leading-relaxed text-[#222]">
            STATUS:&nbsp;&nbsp;&nbsp;{data.status.toUpperCase()}<br />
            SIGNED_AT: {data.signed_at ? new Date(data.signed_at).toISOString().slice(0, 19).replace("T", " ") : "—"} UTC
            <br />
            REFERENCE: {String(data.id).slice(0, 8)}
          </div>
        </div>

        <p className="text-sm text-[#444] mb-8">
          We&rsquo;ll be in touch shortly. If you need to update anything, just reply to the
          email we sent.
        </p>

        <Link href="https://quickomate.com" className="qm-btn-ghost inline-flex no-underline">
          QUICKOMATE.COM →
        </Link>
      </div>
      <footer className="border-t border-[var(--qm-ink)] py-4 max-w-[880px] mx-auto px-6 md:px-14 w-full">
        <div className="flex justify-between gap-4 flex-wrap">
          <div className="qm-mono-label">QUICKOMATE / THE DEFINITIVE AI GROWTH PARTNER</div>
          <div className="qm-mono-label">QUICKOMATE.COM</div>
        </div>
      </footer>
    </main>
  );
}
