export type ContractStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "signed"
  | "declined"
  | "expired";

export type Deliverable = { label: string; detail?: string };
export type Clause = { heading: string; body: string };

export type Fees = {
  amount?: string;
  currency?: string;
  schedule?: string;
  term?: string;
  notes?: string;
};

export type Contract = {
  id: string;
  share_token: string;
  owner_id: string | null;

  client_name: string;
  client_email: string;
  client_company: string | null;
  client_title: string | null;

  title: string;
  effective_date: string | null;
  lede: string | null;
  scope: string | null;
  deliverables: Deliverable[];
  fees: Fees;
  terms: Clause[];
  custom_blocks: Clause[];

  doc_number: string | null;

  status: ContractStatus;
  sent_at: string | null;
  viewed_at: string | null;
  signed_at: string | null;

  signer_signature_png: string | null;
  signer_typed_name: string | null;
  signer_ip: string | null;
  signer_user_agent: string | null;
  signed_pdf_path: string | null;

  created_at: string;
  updated_at: string;
};

export type AdminSettings = {
  owner_id: string;
  signature_png_path: string | null;
  signature_typed_name: string | null;
  display_name: string | null;
  display_email: string | null;
};
