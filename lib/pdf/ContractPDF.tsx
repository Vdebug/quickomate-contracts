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
    marginBottom: 22,
  },
  brand: { fontSize: 9, fontWeight: 700, marginTop: 4 },
  docMeta: { textAlign: "right", fontFamily: "Space Mono", fontSize: 8, color: palette.muted, lineHeight: 1.6 },
  cover: { fontSize: 28, fontWeight: 700, marginTop: 4, marginBottom: 12, lineHeight: 1.05 },
  lede: { fontFamily: "DM Serif Display", fontSize: 12, color: "#222", marginBottom: 22, lineHeight: 1.4 },
  parties: { flexDirection: "row", gap: 8, marginBottom: 22 },
  party: { flex: 1, backgroundColor: palette.surface, borderWidth: 0.6, borderColor: palette.ink, padding: 10 },
  partyName: { fontSize: 12, fontWeight: 700, marginTop: 2 },
  partySub: { fontSize: 9, color: "#333", marginTop: 3 },
  section: { marginBottom: 16 },
  sectionNum: { fontFamily: "Space Mono", color: palette.accent, fontSize: 8, fontWeight: 700, marginBottom: 3 },
  sectionH2: { fontSize: 14, fontWeight: 700, marginBottom: 6 },
  para: { fontSize: 10, lineHeight: 1.55 },
  letterBody: { fontFamily: "DM Serif Display", fontSize: 11.5, color: "#222", lineHeight: 1.5 },
  letterSig: { fontSize: 10, marginTop: 10 },
  bulletItem: { flexDirection: "row", marginBottom: 4 },
  bulletNum: { fontFamily: "Space Mono", color: palette.accent, fontSize: 8, fontWeight: 700, width: 22 },
  bulletText: { flex: 1, fontSize: 10, lineHeight: 1.5 },
  timelineItem: { flexDirection: "row", marginBottom: 4 },
  timelineLabel: { fontFamily: "Space Mono", color: palette.accent, fontSize: 8, fontWeight: 700, width: 70 },
  timelineText: { flex: 1, fontSize: 10, lineHeight: 1.5 },
  relatedGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  relatedTile: {
    width: "48%",
    backgroundColor: palette.surface,
    borderWidth: 0.6,
    borderColor: palette.ink,
    padding: 10,
  },
  relatedTitle: { fontSize: 10, fontWeight: 700, marginBottom: 4 },
  relatedBody: { fontSize: 9, color: "#222", lineHeight: 1.5 },
  feesBlock: {
    backgroundColor: palette.ink,
    color: palette.inverted,
    padding: 14,
    flexDirection: "row",
    gap: 18,
    marginTop: 4,
    marginBottom: 6,
  },
  feeCell: { flex: 1 },
  feeLabel: { fontFamily: "Space Mono", fontSize: 7.5, opacity: 0.7, color: palette.inverted },
  feeVal: { fontSize: 17, fontWeight: 700, marginTop: 3, color: palette.inverted },
  feesNote: { fontSize: 9, color: "#444", marginTop: 4 },
  termsLead: { fontSize: 9.5, color: "#444", marginBottom: 6 },
  clause: { borderTopWidth: 0.4, borderTopColor: "#bbb", paddingTop: 5, paddingBottom: 5 },
  clauseH3: { fontSize: 9, fontWeight: 700, color: palette.ink },
  clauseP: { fontSize: 9.5, color: "#222", marginTop: 2, lineHeight: 1.5 },
  sigSection: { marginTop: 22, borderTopWidth: 1.5, borderTopColor: palette.ink, paddingTop: 14 },
  sigGrid: { flexDirection: "row", gap: 12, marginTop: 10 },
  sigCell: { flex: 1, borderWidth: 0.6, borderColor: palette.ink, backgroundColor: "#fff", padding: 10 },
  sigLabel: { fontFamily: "Space Mono", fontSize: 7.5, color: "#555", marginBottom: 6 },
  sigImage: { height: 48, marginBottom: 4, objectFit: "contain" },
  sigImageFallback: { height: 48, justifyContent: "flex-end", paddingBottom: 6 },
  sigImageFallbackText: { fontSize: 18, color: palette.ink, lineHeight: 1.0 },
  sigBaseline: { borderBottomWidth: 0.5, borderBottomColor: palette.ink, height: 1, marginBottom: 6 },
  sigMeta: { fontFamily: "Space Mono", fontSize: 7.5, color: palette.muted, lineHeight: 1.7 },
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
  const docNumber = contract.doc_number ?? "-";
  const company = contract.client_company ?? contract.client_name;
  const firstName = contract.client_name.split(" ")[0];
  const effective = contract.effective_date
    ? new Date(contract.effective_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()
    : new Date(contract.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.mono}>QUICKOMATE / PROPOSAL</Text>
            <Text style={s.brand}>// {contract.title.toUpperCase()}</Text>
          </View>
          <View style={s.docMeta}>
            <Text>DOC: {docNumber}</Text>
            <Text>EFFECTIVE: {effective}</Text>
            <Text>STATUS: {contract.status === "signed" ? "SIGNED" : "PROPOSAL"}</Text>
          </View>
        </View>

        {/* Cover */}
        <Text style={s.cover}>{company}{"\n"}{contract.title}.</Text>
        <Text style={s.lede}>
          This proposal contains all the details and pricing regarding the scope of work and terms requested by {contract.client_name}.
        </Text>

        {/* Parties */}
        <View style={s.parties}>
          <View style={s.party}>
            <Text style={s.mono}>// FROM</Text>
            <Text style={s.partyName}>Quickomate</Text>
            <Text style={s.partySub}>{provider.name} · {provider.email}</Text>
          </View>
          <View style={s.party}>
            <Text style={s.mono}>// TO</Text>
            <Text style={s.partyName}>{company}</Text>
            <Text style={s.partySub}>
              {contract.client_name}
              {contract.client_title ? `, ${contract.client_title}` : ""} · {contract.client_email}
            </Text>
          </View>
        </View>

        {/* 01, Personal Letter */}
        {contract.letter && (
          <View style={s.section}>
            <Text style={s.sectionNum}>01 / LETTER</Text>
            <Text style={s.sectionH2}>Hi {firstName},</Text>
            <Text style={s.letterBody}>{contract.letter}</Text>
            <Text style={s.letterSig}>
              Thanks,{"\n"}
              <Text style={{ fontWeight: 700 }}>{provider.name}</Text>{"\n"}
              {provider.email}
            </Text>
          </View>
        )}

        {/* 02, Problem */}
        {(contract.problem?.title || contract.problem?.body) && (
          <View style={s.section}>
            <Text style={s.sectionNum}>02 / PROBLEM</Text>
            <Text style={s.sectionH2}>{contract.problem.title ?? `${company} suffers from a few core issues.`}</Text>
            {contract.problem.body && <Text style={s.para}>{contract.problem.body}</Text>}
          </View>
        )}

        {/* 03, Solution */}
        {contract.scope && (
          <View style={s.section}>
            <Text style={s.sectionNum}>03 / SOLUTION</Text>
            <Text style={s.sectionH2}>My proposed solution to the problems above.</Text>
            <Text style={s.para}>{contract.scope}</Text>
          </View>
        )}

        {/* 04, Scope of Work */}
        {contract.deliverables.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionNum}>04 / SCOPE OF WORK</Text>
            <Text style={s.sectionH2}>Quickomate will build a system that fulfils the following:</Text>
            {contract.deliverables.map((d, i) => (
              <View key={i} style={s.bulletItem}>
                <Text style={s.bulletNum}>{String(i + 1).padStart(2, "0")}</Text>
                <Text style={s.bulletText}>
                  <Text style={{ fontWeight: 700 }}>{d.label}</Text>
                  {d.detail ? `, ${d.detail}` : ""}
                </Text>
              </View>
            ))}
            <Text style={[s.para, { marginTop: 6, color: "#444" }]}>
              By taking a disciplined approach and remaining in constant contact with {firstName}, I&rsquo;ll ensure delivery to spec and on schedule.
            </Text>
          </View>
        )}

        {/* 05, Timeline */}
        {contract.timeline && contract.timeline.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionNum}>05 / TIMELINE</Text>
            <Text style={s.sectionH2}>When you can expect what.</Text>
            {contract.timeline.map((t, i) => (
              <View key={i} style={s.timelineItem}>
                <Text style={s.timelineLabel}>{(t.label || "").toUpperCase()}</Text>
                <Text style={s.timelineText}>{t.detail}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 06, Related Systems */}
        {contract.related_systems && contract.related_systems.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionNum}>06 / RELATED SYSTEMS</Text>
            <Text style={s.sectionH2}>Other high-ROI systems Quickomate operates.</Text>
            <View style={s.relatedGrid}>
              {contract.related_systems.map((r, i) => (
                <View key={i} style={s.relatedTile}>
                  <Text style={s.relatedTitle}>{r.title}</Text>
                  <Text style={s.relatedBody}>{r.body}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 07, Your Investment */}
        {(contract.fees?.amount || contract.fees?.deposit) && (
          <View style={s.section}>
            <Text style={s.sectionNum}>07 / YOUR INVESTMENT</Text>
            <Text style={s.sectionH2}>Pricing &amp; terms.</Text>
            <View style={s.feesBlock}>
              {contract.fees.amount && (
                <View style={s.feeCell}>
                  <Text style={s.feeLabel}>// INVESTMENT</Text>
                  <Text style={s.feeVal}>{contract.fees.amount}</Text>
                </View>
              )}
              {contract.fees.deposit && (
                <View style={s.feeCell}>
                  <Text style={s.feeLabel}>// {(contract.fees.deposit_label ?? "DUE AT SIGNING").toUpperCase()}</Text>
                  <Text style={s.feeVal}>{contract.fees.deposit}</Text>
                </View>
              )}
            </View>
            <Text style={s.feesNote}>
              {contract.fees.notes ?? "Delivery is defined as the fulfilment of the scope conditions above. Your payment is due upon full satisfaction with the project."}
            </Text>
          </View>
        )}

        {/* 08, Terms */}
        {contract.terms.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionNum}>08 / TERMS</Text>
            <Text style={s.sectionH2}>Operating terms.</Text>
            <Text style={s.termsLead}>
              {provider.name} will build the system above for {company} per the scope laid out in this proposal. The terms below protect your confidentiality and streamline our information sharing. Questions? Email {provider.email}.
            </Text>
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
                DATE: {contract.signed_at ? new Date(contract.signed_at).toISOString().slice(0, 19).replace("T", " ") + " UTC" : "-"}
              </Text>
            </View>
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
