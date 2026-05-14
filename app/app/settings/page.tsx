import { createAdminClient } from "@/lib/supabase/admin";
import { ADMIN_OWNER_ID } from "@/lib/auth";
import { SettingsForm } from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = createAdminClient();
  const { data: settings } = await supabase
    .from("admin_settings")
    .select("*")
    .eq("owner_id", ADMIN_OWNER_ID)
    .maybeSingle();

  let signaturePreview: string | null = null;
  if (settings?.signature_png_path) {
    const { data } = await supabase.storage
      .from("signatures")
      .createSignedUrl(settings.signature_png_path, 60 * 60);
    signaturePreview = data?.signedUrl ?? null;
  }

  const fallbackName = process.env.NEXT_PUBLIC_PROVIDER_NAME ?? "Vasu Gupta";
  const fallbackEmail = process.env.NEXT_PUBLIC_PROVIDER_EMAIL ?? "vasu@quickomate.com";

  return (
    <main className="max-w-[840px] mx-auto px-6 py-12">
      <div className="mb-10">
        <div className="qm-mono-label mb-2">// SETTINGS</div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[.95]">
          Your signature.
        </h1>
        <p className="font-serif text-xl text-[#333] mt-3 max-w-[640px]">
          Draw or upload your signature once. It gets auto-applied to every contract you send,
          so you don&rsquo;t have to countersign anything manually.
        </p>
      </div>
      <SettingsForm
        defaultName={settings?.display_name ?? fallbackName}
        defaultEmail={settings?.display_email ?? fallbackEmail}
        signaturePreview={signaturePreview}
      />
    </main>
  );
}
