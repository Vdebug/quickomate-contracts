"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateShareToken, nextDocNumber } from "@/lib/util";
import { isAuthenticatedFromCookies, ADMIN_OWNER_ID } from "@/lib/auth";

const DeliverableSchema = z.object({
  label: z.string().min(1),
  detail: z.string().optional().default(""),
});

const ClauseSchema = z.object({
  heading: z.string().min(1),
  body: z.string().min(1),
});

const PayloadSchema = z.object({
  title: z.string().min(1),
  effective_date: z.string().optional().nullable(),
  client_name: z.string().min(1),
  client_email: z.string().email(),
  client_company: z.string().optional().nullable(),
  client_title: z.string().optional().nullable(),
  lede: z.string().optional().nullable(),
  scope: z.string().optional().nullable(),
  deliverables: z.array(DeliverableSchema),
  fees: z.object({
    amount: z.string().optional(),
    term: z.string().optional(),
    notes: z.string().optional(),
  }),
  terms: z.array(ClauseSchema),
});

export type ContractInput = z.infer<typeof PayloadSchema>;

export async function createContract(input: ContractInput) {
  if (!(await isAuthenticatedFromCookies())) throw new Error("Not authenticated");
  const parsed = PayloadSchema.parse(input);

  const admin = createAdminClient();
  const { count } = await admin
    .from("contracts")
    .select("id", { count: "exact", head: true });

  const docNumber = nextDocNumber(new Date(), count ?? 0);
  const shareToken = generateShareToken();

  const { data, error } = await admin
    .from("contracts")
    .insert({
      owner_id: ADMIN_OWNER_ID,
      share_token: shareToken,
      doc_number: docNumber,
      title: parsed.title,
      effective_date: parsed.effective_date || null,
      lede: parsed.lede || null,
      scope: parsed.scope || null,
      client_name: parsed.client_name,
      client_email: parsed.client_email,
      client_company: parsed.client_company || null,
      client_title: parsed.client_title || null,
      deliverables: parsed.deliverables,
      fees: parsed.fees,
      terms: parsed.terms,
      status: "draft",
    })
    .select("id")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to create contract");

  await admin.from("contract_events").insert({
    contract_id: data.id,
    event_type: "created",
    metadata: { doc_number: docNumber },
  });

  revalidatePath("/app");
  redirect(`/app/contracts/${data.id}`);
}
