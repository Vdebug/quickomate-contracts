import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Hr,
} from "@react-email/components";

type Props = {
  recipientName: string;
  clientName: string;
  clientCompany?: string | null;
  signedAtIso: string;
  contractTitle: string;
  audience: "client" | "admin";
};

export function SignedConfirmation({
  recipientName,
  clientName,
  clientCompany,
  signedAtIso,
  contractTitle,
  audience,
}: Props) {
  const greeting = recipientName.split(" ")[0];
  return (
    <Html>
      <Head />
      <Preview>
        {audience === "client"
          ? `Signed — ${contractTitle}`
          : `${clientCompany ?? clientName} signed — ${contractTitle}`}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={mono}>QUICKOMATE / SIGNED</Text>
          <Heading style={h1}>
            {audience === "client" ? "Thanks — you're signed." : "Signed."}
          </Heading>
          <Text style={p}>Hi {greeting},</Text>
          {audience === "client" ? (
            <Text style={p}>
              Thanks for signing the {contractTitle}. A copy is attached to this email for your
              records — both parties have received it.
            </Text>
          ) : (
            <Text style={p}>
              <strong>{clientName}</strong>
              {clientCompany ? ` (${clientCompany})` : ""} signed the {contractTitle}. The
              countersigned PDF is attached.
            </Text>
          )}
          <Text style={p}>
            <strong>Signed at:</strong> {new Date(signedAtIso).toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short" })}
          </Text>
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
const hr = { borderColor: "#1111111A", margin: "32px 0 12px" };
const footer = {
  fontSize: "10px",
  letterSpacing: "0.05em",
  textTransform: "uppercase" as const,
  color: "#6B6960",
  margin: 0,
};
