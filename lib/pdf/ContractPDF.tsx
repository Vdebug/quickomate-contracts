import path from "node:path";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import type { Contract } from "@/lib/types";

// Register fonts from local TTFs in public/fonts (offline-capable, version-stable)
const FONT_DIR = path.join(process.cwd(), "public", "fonts");

Font.register({
  family: "Space Grotesk",
  fonts: [
    { src: path.join(FONT_DIR, "SpaceGrotesk-Regular.ttf"), fontWeight: 400 },
    { src: path.join(FONT_DIR, "SpaceGrotesk-Bold.ttf"), fontWeight: 700 },
  ],
});
Font.register({
  family: "DM Serif Display",
  src: path.join(FONT_DIR, "DMSerifDisplay-Regular.ttf"),
});
Font.register({
  family: "Space Mono",
  fonts: [
    { src: path.join(FONT_DIR, "SpaceMono-Regular.ttf"), fontWeight: 400 },
    { src: path.join(FONT_DIR, "SpaceMono-Bold.ttf"), fontWeight: 700 },
  ],
});

const palette = {
  bg: "#F5F3EE",
  surface: "#E8E4DD",
  ink: "#111111",
  accent: "#E63B2E",
  inverted: "#E8E4DD",
  muted: "#444444",
};

const s = StyleSheet.create({
  page: {
    backgroundColor: palette.bg,
    color: palette.ink,
    fontFamily: "Space Grotesk",
    fontSize: 10.5,
    lineHeight: 1.5,
    paddingHorizontal: 50,
    paddingVertical: 50,
  },
  mono: { fontFamily: "Space Mono", fontSize: 8, color: palette.muted, letterSpacing: 0.6 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1.5,
    borderBottomColor: palette.ink,
    paddingBottom: 10,
    marginBottom: 18,
  },
  brand: { fontSize: 9, fontWeight: 700, marginTop: 4 },
  docMeta: { textAlign: "right", fontFamily: "Space Mono", fontSize: 8, color: palette.muted, lineHeight: 1.6 },
  title: { fontSize: 32, fontWeight: 700, marginTop: 10, marginBottom: 16, lineHeight: 1.05 },
  lede: { fontFamily: "DM Serif Display", fontSize: 13, color: "#222", marginBottom: 20, lineHeight: 1.4 },
  parties: { flexDirection: "row", gap: 8, marginBottom: 20 },
  party: { flex: 1, backgroundColor: palette.surface, borderWidth: 0.6, borderColor: palette.ink, padding: 10 },
  partyName: { fontSize: 12, fontWeight: 700, marginTop: 2 },
  partySub: { fontSize: 9, color: "#333", marginTop: 3 },
  section: { marginBottom: 14 },
  sectionNum: { fontFamily: "Space Mono", color: palette.accent, fontSize: 8, fontWeight: 700, marginBottom: 3 },
  sectionH2: { fontSize: 14, fontWeight: 700, marginBottom: 6 },
  para: { fontSize: 10, lineHeight: 1.55 },
  deliverableItem: { flexDirection: "row", marginBottom: 4 },
  deliverableNum: { fontFamily: "Space Mono", color: palette.accent, fontSize: 8, fontWeight: 700, width: 22 },
  deliverableText: { flex: 1, fontSize: 10, lineHeight: 1.5 },
  feesBlock: {
    backgroundColor: palette.ink,
    color: palette.inverted,
    padding: 14,
    flexDirection: "row",
    gap: 18,
    marginTop: 4,
  },
  feeCell: { flex: 1 },
  feeLabel: { fontFamily: "Space Mono", fontSize: 7.5, opacity: 0.7, color: palette.inverted },
  feeVal: { fontSize: 17, fontWeight: 700, marginTop: 3, color: palette.inverted },
  clause: { borderTopWidth: 0.4, borderTopColor: "#bbb", paddingTop: 5, paddingBottom: 5 },
  clauseH3: { fontSize: 9, fontWeight: 700, color: palette.ink },
  clauseP: { fontSize: 9.5, color: "#222", marginTop: 2, lineHeight: 1.5 },
  sigSection: { marginTop: 22, borderTopWidth: 1.5, borderTopColor: palette.ink, paddingTop: 14 },
  sigGrid: { flexDirection: "row", gap: 12, marginTop: 10 },
  sigCell: { flex: 1, borderWidth: 0.6, borderColor: palette.ink, backgroundColor: "#fff", padding: 10 },
  sigLabel: { fontFamily: "Space Mono", fontSize: 7.5, color: "#555", marginBottom: 6 },
  sigImage: { height: 42, marginBottom: 4 },
  sigImageFallback: { height: 42, justifyContent: "flex-end" },
  sigImageFallbackText: { fontSize: 22, color: palette.ink },
  sigBaseline: { borderBottomWidth: 0.5, borderBottomColor: palette.ink, height: 1, marginBottom: 6 },
  sigMeta: { fontFamily: "Space Mono", fontSize: 7.5, color: palette.muted, lineHeight: 1.7 },
  audit: {
    marginTop: 16,
    backgroundColor: palette.surface,
    borderWidth: 0.6,
    borderColor: palette.ink,
    padding: 10,
  },
  auditTitle: { fontFamily: "Space Mono", color: palette.accent, fontSize: 7.5, fontWeight: 700, marginBottom: 4 },
  auditLine: { fontFamily: "Space Mono", fontSize: 7.5, color: "#222", lineHeight: 1.7 },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 50,
    right: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.4,
    borderTopColor: palette.ink,
    paddingTop: 6,
    fontFamily: "Space Mono",
    fontSize: 7,
    color: palette.muted,
  },
});

type ProviderInfo = { name: string; email: string; signaturePng?: string | null };

export function ContractPDF({
  contract,
  provider,
}: {
  contract: Contract;
  provider: ProviderInfo;
}) {
  const docNumber = contract.doc_number ?? "—";
  const effective = contract.effective_date
    ? new Date(contract.effective_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()
    : new Date(contract.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.mono}>QUICKOMATE / SIGNED CONTRACT</Text>
            <Text style={s.brand}>// {contract.title.toUpperCase()}</Text>
          </View>
          <View style={s.docMeta}>
            <Text>DOC: {docNumber}</Text>
            <Text>EFFECTIVE: {effective}</Text>
            <Text>STATUS: SIGNED</Text>
          </View>
        </View>

        <Text style={s.title}>Build growth{"\n"}that compounds.</Text>
        {contract.lede && <Text style={s.lede}>{contract.lede}</Text>}

        {/* Parties */}
        <View style={s.parties}>
          <View style={s.party}>
            <Text style={s.mono}>// PROVIDER</Text>
            <Text style={s.partyName}>Quickomate</Text>
            <Text style={s.partySub}>{provider.name} · {provider.email}</Text>
          </View>
          <View style={s.party}>
            <Text style={s.mono}>// CLIENT</Text>
            <Text style={s.partyName}>{contract.client_company ?? contract.client_name}</Text>
            <Text style={s.partySub}>
              {contract.client_name}
              {contract.client_title ? `, ${contract.client_title}` : ""} · {contract.client_email}
            </Text>
          </View>
        </View>

        {/* Scope */}
        {contract.scope && (
          <View style={s.section}>
            <Text style={s.sectionNum}>01 / SCOPE</Text>
            <Text style={s.sectionH2}>What we&rsquo;re building</Text>
            <Text style={s.para}>{contract.scope}</Text>
          </View>
        )}

        {/* Deliverables */}
        {contract.deliverables.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionNum}>02 / DELIVERABLES</Text>
            <Text style={s.sectionH2}>What you get</Text>
            {contract.deliverables.map((d, i) => (
              <View key={i} style={s.deliverableItem}>
                <Text style={s.deliverableNum}>{String(i + 1).padStart(2, "0")}</Text>
                <Text style={s.deliverableText}>
                  <Text style={{ fontWeight: 700 }}>{d.label}</Text>
                  {d.detail ? ` — ${d.detail}` : ""}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Fees */}
        {(contract.fees.amount || contract.fees.term) && (
          <View style={s.section}>
            <Text style={s.sectionNum}>03 / FEES & TERM</Text>
            <Text style={s.sectionH2}>Commercials</Text>
            <View style={s.feesBlock}>
              {contract.fees.amount && (
                <View style={s.feeCell}>
                  <Text style={s.feeLabel}>// ENGAGEMENT FEE</Text>
                  <Text style={s.feeVal}>{contract.fees.amount}</Text>
                </View>
              )}
              {contract.fees.term && (
                <View style={s.feeCell}>
                  <Text style={s.feeLabel}>// TERM</Text>
                  <Text style={s.feeVal}>{contract.fees.term}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Terms */}
        {contract.terms.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionNum}>04 / TERMS</Text>
            <Text style={s.sectionH2}>Operating terms</Text>
            {contract.terms.map((c, i) => (
              <View key={i} style={s.clause}>
                <Text style={s.clauseH3}>{c.heading.toUpperCase()}</Text>
                <Text style={s.clauseP}>{c.body}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Signatures */}
        <View style={s.sigSection}>
          <Text style={s.sectionH2}>Signatures</Text>
          <View style={s.sigGrid}>
            <View style={s.sigCell}>
              <Text style={s.sigLabel}>// PROVIDER</Text>
              {provider.signaturePng ? (
                <Image src={provider.signaturePng} style={s.sigImage} />
              ) : (
                <View style={s.sigImageFallback}>
                  <Text style={s.sigImageFallbackText}>{provider.name}</Text>
                </View>
              )}
              <View style={s.sigBaseline} />
              <Text style={s.sigMeta}>
                NAME: {provider.name}{"\n"}
                QUICKOMATE{"\n"}
                DATE: {new Date(contract.signed_at ?? Date.now()).toISOString().slice(0, 10)}
              </Text>
            </View>
            <View style={s.sigCell}>
              <Text style={s.sigLabel}>// CLIENT</Text>
              {contract.signer_signature_png ? (
                <Image src={contract.signer_signature_png} style={s.sigImage} />
              ) : (
                <View style={s.sigImageFallback}>
                  <Text style={s.sigImageFallbackText}>{contract.signer_typed_name ?? contract.client_name}</Text>
                </View>
              )}
              <View style={s.sigBaseline} />
              <Text style={s.sigMeta}>
                NAME: {contract.signer_typed_name ?? contract.client_name}{"\n"}
                {(contract.client_company ?? "").toUpperCase()}{"\n"}
                DATE: {contract.signed_at ? new Date(contract.signed_at).toISOString().slice(0, 19).replace("T", " ") + " UTC" : "—"}
              </Text>
            </View>
          </View>

          <View style={s.audit}>
            <Text style={s.auditTitle}>// AUDIT TRAIL</Text>
            <Text style={s.auditLine}>CONTRACT_ID: {contract.id}</Text>
            <Text style={s.auditLine}>SIGNED_AT:   {contract.signed_at ?? "—"}</Text>
            <Text style={s.auditLine}>SIGNER_IP:   {contract.signer_ip ?? "—"}</Text>
            <Text style={s.auditLine}>USER_AGENT:  {contract.signer_user_agent ?? "—"}</Text>
            <Text style={s.auditLine}>SHARE_TOKEN: {contract.share_token}</Text>
          </View>
        </View>

        <View style={s.footer} fixed>
          <Text>QUICKOMATE / {contract.title.toUpperCase()} / {docNumber}</Text>
          <Text render={({ pageNumber, totalPages }) => `PAGE ${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
