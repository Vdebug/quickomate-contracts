import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components";

type Props = {
  clientName: string;
  clientCompany?: string | null;
  signUrl: string;
  providerName: string;
  contractTitle: string;
};

export function ClientInvite({
  clientName,
  clientCompany,
  signUrl,
  providerName,
  contractTitle,
}: Props) {
  const firstName = clientName.split(" ")[0];
  return (
    <Html>
      <Head />
      <Preview>
        Quickomate, {contractTitle} for {clientCompany ?? clientName}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={mono}>QUICKOMATE</Text>
          <Heading style={h1}>{contractTitle}</Heading>
          <Text style={p}>Hi {firstName},</Text>
          <Text style={p}>
            Following our conversation, here&rsquo;s the {contractTitle} for{" "}
            <strong>{clientCompany ?? clientName}</strong>. Please review and sign at your
            convenience, it should take 2 minutes.
          </Text>
          <Section style={{ margin: "32px 0" }}>
            <Button style={btn} href={signUrl}>
              REVIEW &amp; SIGN CONTRACT  →
            </Button>
          </Section>
          <Text style={p}>
            If anything looks off, just reply to this email and we&rsquo;ll adjust.
          </Text>
          <Text style={p}>- {providerName}, Quickomate</Text>
          <Hr style={hr} />
          <Text style={footer}>
            QUICKOMATE / THE DEFINITIVE AI GROWTH PARTNER · quickomate.com
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const body = { backgroundColor: "#F5F3EE", fontFamily: "Arial, sans-serif", color: "#111111" };
const container = { maxWidth: "560px", margin: "0 auto", padding: "40px 24px" };
const mono = {
  fontSize: "11px",
  letterSpacing: "0.06em",
  textTransform: "uppercase" as const,
  color: "#6B6960",
  marginBottom: "12px",
};
const h1 = { fontSize: "30px", fontWeight: 700, margin: "8px 0 24px", lineHeight: 1.1, color: "#111" };
const p = { fontSize: "15px", lineHeight: 1.55, color: "#222", margin: "0 0 14px" };
const btn = {
  background: "#E63B2E",
  color: "#fff",
  padding: "16px 22px",
  fontWeight: 700,
  letterSpacing: "0.02em",
  textDecoration: "none",
  display: "inline-block",
  fontSize: "14px",
};
const hr = { borderColor: "#1111111A", margin: "32px 0 12px" };
const footer = {
  fontSize: "10px",
  letterSpacing: "0.05em",
  textTransform: "uppercase" as const,
  color: "#6B6960",
  margin: 0,
};
