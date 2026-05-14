import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { ContractDocument } from "@/components/ContractDocument";
import { SignForm } from "./SignForm";
import type { Contract } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PublicContractPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("contracts")
    .select("*")
    .eq("share_token", token)
    .maybeSingle();

  if (error || !data) notFound();
  const contract = data as Contract;

  // Mark viewed (fire-and-forget)
  await supabase.rpc("mark_contract_viewed", { token });

  const provider = {
    name: process.env.NEXT_PUBLIC_PROVIDER_NAME ?? "Vasu Gupta",
    email: process.env.NEXT_PUBLIC_PROVIDER_EMAIL ?? "vasu@quickomate.com",
  };

  const alreadySigned = contract.status === "signed";

  return (
    <main className="min-h-screen">
      <div className="max-w-[880px] mx-auto px-6 md:px-14 py-12 md:py-16">
        <ContractDocument contract={contract} provider={provider} />

        {alreadySigned ? (
          <div className="mt-16 border-t-2 border-[var(--qm-ink)] pt-8">
            <div className="qm-section-num mb-2">// STATUS</div>
            <h2 className="text-3xl font-bold mb-2">Signed</h2>
            <p className="font-serif text-lg text-[#333] mb-2">
              This contract was signed on{" "}
              {contract.signed_at
                ? new Date(contract.signed_at).toLocaleString("en-GB", {
                    dateStyle: "long",
                    timeStyle: "short",
                  })
                : "—"}
              {contract.signer_typed_name ? ` by ${contract.signer_typed_name}` : ""}.
            </p>
            <p className="text-sm text-[#666]">
              A copy of the signed agreement has been emailed to both parties.
            </p>
          </div>
        ) : (
          <SignForm token={contract.share_token} />
        )}

        <footer className="mt-16 border-t border-[var(--qm-ink)] pt-4 flex justify-between gap-4 flex-wrap">
          <div className="qm-mono-label">QUICKOMATE / THE DEFINITIVE AI GROWTH PARTNER</div>
          <div className="qm-mono-label">QUICKOMATE.COM</div>
        </footer>
      </div>
    </main>
  );
}
