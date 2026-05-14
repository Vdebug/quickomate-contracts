"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAuthenticatedFromCookies, ADMIN_OWNER_ID } from "@/lib/auth";

const SettingsSchema = z.object({
  display_name: z.string().min(1),
  display_email: z.string().email(),
  signature_png: z
    .string()
    .startsWith("data:image/png;base64,")
    .nullable(),
});

export async function saveSettings(input: z.infer<typeof SettingsSchema>) {
  if (!(await isAuthenticatedFromCookies())) throw new Error("Not authenticated");
  const parsed = SettingsSchema.parse(input);

  const admin = createAdminClient();

  let signaturePath: string | undefined;
  if (parsed.signature_png) {
    const b64 = parsed.signature_png.split(",", 2)[1] ?? "";
    const buf = Buffer.from(b64, "base64");
    const path = `admin/signature.png`;
    const { error: upErr } = await admin.storage
      .from("signatures")
      .upload(path, buf, { contentType: "image/png", upsert: true });
    if (upErr) throw new Error(`Upload failed: ${upErr.message}`);
    signaturePath = path;
  }

  const update = {
    owner_id: ADMIN_OWNER_ID,
    display_name: parsed.display_name,
    display_email: parsed.display_email,
    ...(signaturePath ? { signature_png_path: signaturePath } : {}),
  };

  const { error } = await admin
    .from("admin_settings")
    .upsert(update, { onConflict: "owner_id" });
  if (error) throw new Error(error.message);

  revalidatePath("/app/settings");
}
