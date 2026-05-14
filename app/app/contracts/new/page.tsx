import { ContractForm } from "./ContractForm";

export const dynamic = "force-dynamic";

export default function NewContractPage() {
  return (
    <main className="max-w-[1200px] mx-auto px-6 py-12">
      <div className="mb-10">
        <div className="qm-mono-label mb-2">// NEW CONTRACT</div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[.95]">
          Draft a new agreement.
        </h1>
        <p className="font-serif text-xl text-[#333] mt-3 max-w-[640px]">
          Fill out the client details and contract content. You can save it as a draft, then
          send it from the dashboard.
        </p>
      </div>
      <ContractForm />
    </main>
  );
}
