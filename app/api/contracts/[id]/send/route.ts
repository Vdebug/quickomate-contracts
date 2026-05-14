import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { render as renderEmail } from "@react-email/components";

import { createAdminClient } from "@/lib/supabase/admin";
import { ClientInvite } from "@/lib/email/ClientInvite";
import { isAuthenticatedFromCookies } from "@/lib/auth";
import type { Contract } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticatedFromCookies())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const admin = createAdminClient();

  const { data: contract, error } = await admin
    .from("contracts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !contract) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const c = contract as Contract;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? new URL(req.url).origin;
  const signUrl = `${baseUrl}/c/${c.share_token}`;

  const resendKey = process.env.RESEND_API_KEY;
  const providerName = process.env.NEXT_PUBLIC_PROVIDER_NAME ?? "Vasu Gupta";
  const providerEmail = process.env.NEXT_PUBLIC_PROVIDER_EMAIL ?? "vasu@quickomate.com";
  const fromAddress = process.env.RESEND_FROM ?? "Quickomate <onboarding@resend.dev>";

  if (!resendKey) {
    // Local dev fallback: skip the actual send, just mark as sent + log
    await admin
      .from("contracts")
      .update({
        status: c.status === "draft" ? "sent" : c.status,
        sent_at: c.sent_at ?? new Date().toISOString(),
      })
      .eq("id", id);
    await admin.from("contract_events").insert({
      contract_id: id,
      event_type: "sent",
      metadata: { mock: true, sign_url: signUrl, to: c.client_email, bcc: providerEmail },
    });
    return NextResponse.json({ ok: true, mock: true, sign_url: signUrl });
  }

  const resend = new Resend(resendKey);
  const html = await renderEmail(
    ClientInvite({
      clientName: c.client_name,
      clientCompany: c.client_company,
      signUrl,
      providerName,
      contractTitle: c.title,
    })
  );

  try {
    // Single email, BCC the admin so they get an exact copy in their inbox.
    await resend.emails.send({
      from: fromAddress,
      to: c.client_email,
      bcc: providerEmail,
      subject: `Quickomate — ${c.title} for ${c.client_company ?? c.client_name}`,
      html,
    });
  } catch (err) {
    console.error("Send failed", err);
    return NextResponse.json({ error: "Email provider failed" }, { status: 502 });
  }

  await admin
    .from("contracts")
    .update({
      status: c.status === "draft" ? "sent" : c.status,
      sent_at: c.sent_at ?? new Date().toISOString(),
    })
    .eq("id", id);
  await admin.from("contract_events").insert({
    contract_id: id,
    event_type: "sent",
    metadata: { to: c.client_email, bcc: providerEmail, sign_url: signUrl },
  });

  return NextResponse.json({ ok: true, sign_url: signUrl });
}
