import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { renderToBuffer } from "@react-pdf/renderer";
import { render as renderEmail } from "@react-email/components";
import { Resend } from "resend";

import { createAdminClient } from "@/lib/supabase/admin";
import { ContractPDF } from "@/lib/pdf/ContractPDF";
import { SignedConfirmation } from "@/lib/email/SignedConfirmation";
import type { Contract } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  token: z.string().min(8),
  typed_name: z.string().min(1).max(120),
  signature_png: z.string().startsWith("data:image/png;base64,"),
});

export async function POST(req: NextRequest) {
  let parsed: z.infer<typeof Body>;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // 1. Load + verify the contract is in a signable state
  const { data: existing, error: loadErr } = await supabase
    .from("contracts")
    .select("*")
    .eq("share_token", parsed.token)
    .maybeSingle();

  if (loadErr || !existing) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }
  if (existing.status === "signed") {
    return NextResponse.json({ error: "This contract has already been signed." }, { status: 409 });
  }
  if (!["sent", "viewed"].includes(existing.status)) {
    return NextResponse.json({ error: "This contract is not currently open for signing." }, { status: 409 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    null;
  const ua = req.headers.get("user-agent") ?? null;

  // 2. Persist the signature
  const { data: updated, error: signErr } = await supabase
    .from("contracts")
    .update({
      signer_typed_name: parsed.typed_name,
      signer_signature_png: parsed.signature_png,
      signer_ip: ip,
      signer_user_agent: ua,
      signed_at: new Date().toISOString(),
      status: "signed",
    })
    .eq("id", existing.id)
    .select("*")
    .single();

  if (signErr || !updated) {
    return NextResponse.json({ error: "Failed to record signature" }, { status: 500 });
  }
  const contract = updated as Contract;

  await supabase.from("contract_events").insert({
    contract_id: contract.id,
    event_type: "signed",
    metadata: { typed_name: parsed.typed_name, ip, ua },
  });

  // 3. Look up the provider's saved signature (admin_settings)
  let providerSig: string | null = null;
  let providerName = process.env.NEXT_PUBLIC_PROVIDER_NAME ?? "Vasu Gupta";
  let providerEmail = process.env.NEXT_PUBLIC_PROVIDER_EMAIL ?? "vasu@quickomate.com";

  if (contract.owner_id) {
    const { data: settings } = await supabase
      .from("admin_settings")
      .select("signature_png_path, display_name, display_email")
      .eq("owner_id", contract.owner_id)
      .maybeSingle();

    if (settings?.display_name) providerName = settings.display_name;
    if (settings?.display_email) providerEmail = settings.display_email;

    if (settings?.signature_png_path) {
      const { data: file } = await supabase.storage
        .from("signatures")
        .download(settings.signature_png_path);
      if (file) {
        const buf = Buffer.from(await file.arrayBuffer());
        providerSig = `data:image/png;base64,${buf.toString("base64")}`;
      }
    }
  }

  // 4. Render the PDF
  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await renderToBuffer(
      ContractPDF({
        contract,
        provider: { name: providerName, email: providerEmail, signaturePng: providerSig },
      })
    );
  } catch (err) {
    console.error("PDF render failed", err);
    return NextResponse.json({ error: "Failed to render PDF" }, { status: 500 });
  }

  // 5. Upload PDF to storage
  const pdfPath = `${contract.id}.pdf`;
  const { error: upErr } = await supabase.storage
    .from("signed-pdfs")
    .upload(pdfPath, pdfBuffer, { contentType: "application/pdf", upsert: true });

  if (!upErr) {
    await supabase.from("contracts").update({ signed_pdf_path: pdfPath }).eq("id", contract.id);
    await supabase.from("contract_events").insert({
      contract_id: contract.id,
      event_type: "pdf_generated",
      metadata: { path: pdfPath, bytes: pdfBuffer.length },
    });
  }

  // 6. Email both parties
  const resendKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.RESEND_FROM ?? "Quickomate <onboarding@resend.dev>";

  if (resendKey) {
    const resend = new Resend(resendKey);
    const pdfAttachment = {
      filename: `quickomate-${contract.title.toLowerCase().replace(/\s+/g, "-")}.pdf`,
      content: pdfBuffer.toString("base64"),
    };

    const clientHtml = await renderEmail(
      SignedConfirmation({
        recipientName: contract.client_name,
        clientName: contract.client_name,
        clientCompany: contract.client_company,
        signedAtIso: contract.signed_at!,
        contractTitle: contract.title,
        audience: "client",
      })
    );
    const adminHtml = await renderEmail(
      SignedConfirmation({
        recipientName: providerName,
        clientName: contract.client_name,
        clientCompany: contract.client_company,
        signedAtIso: contract.signed_at!,
        contractTitle: contract.title,
        audience: "admin",
      })
    );

    try {
      await Promise.all([
        resend.emails.send({
          from: fromAddress,
          to: contract.client_email,
          subject: `Signed, ${contract.title}`,
          html: clientHtml,
          attachments: [pdfAttachment],
        }),
        resend.emails.send({
          from: fromAddress,
          to: providerEmail,
          subject: `${contract.client_company ?? contract.client_name} signed, ${contract.title}`,
          html: adminHtml,
          attachments: [pdfAttachment],
        }),
      ]);
      await supabase.from("contract_events").insert({
        contract_id: contract.id,
        event_type: "emailed",
        metadata: { to: [contract.client_email, providerEmail] },
      });
    } catch (err) {
      console.error("Email send failed", err);
      // Non-fatal: PDF is in storage, admin can resend
    }
  } else {
    console.warn("RESEND_API_KEY not configured, skipping email send.");
  }

  return NextResponse.json({ ok: true, contract_id: contract.id });
}
