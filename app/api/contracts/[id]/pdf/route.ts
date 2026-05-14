import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAuthenticatedFromCookies } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticatedFromCookies())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const admin = createAdminClient();
  const { data: c, error } = await admin
    .from("contracts")
    .select("id, signed_pdf_path, title, doc_number")
    .eq("id", id)
    .maybeSingle();
  if (error || !c) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!c.signed_pdf_path) {
    return NextResponse.json({ error: "Not signed yet" }, { status: 404 });
  }

  const { data: file, error: dlErr } = await admin.storage
    .from("signed-pdfs")
    .download(c.signed_pdf_path);
  if (dlErr || !file) {
    return NextResponse.json({ error: "PDF missing" }, { status: 404 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const filename = `quickomate-${(c.doc_number ?? c.id).toLowerCase()}.pdf`;
  return new NextResponse(arrayBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
