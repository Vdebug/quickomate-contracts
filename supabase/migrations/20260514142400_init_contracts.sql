-- Quickomate Contract Signing App — schema
-- Single-tenant: no auth.users dependency. The app uses env-var password auth
-- and access via the service-role key. All RLS policies deny by default; only
-- the service role (which bypasses RLS) can read/write contracts and settings.
-- The public signing page reads through the service-role server client too.

create extension if not exists "pgcrypto";

-- =========================================================================
-- contracts
-- =========================================================================
create table public.contracts (
  id                 uuid primary key default gen_random_uuid(),
  share_token        text unique not null,
  owner_id           uuid,                 -- single-tenant constant; no FK

  client_name        text not null,
  client_email       text not null,
  client_company     text,
  client_title       text,

  title              text not null default 'Service Agreement',
  effective_date     date,
  lede               text,
  scope              text,
  deliverables       jsonb not null default '[]'::jsonb,
  fees               jsonb not null default '{}'::jsonb,
  terms              jsonb not null default '[]'::jsonb,
  custom_blocks      jsonb not null default '[]'::jsonb,

  doc_number         text,

  status             text not null default 'draft'
                       check (status in ('draft','sent','viewed','signed','declined','expired')),
  sent_at            timestamptz,
  viewed_at          timestamptz,
  signed_at          timestamptz,

  signer_signature_png  text,
  signer_typed_name     text,
  signer_ip             inet,
  signer_user_agent     text,
  signed_pdf_path       text,

  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index contracts_status_idx       on public.contracts(status);
create index contracts_share_token_idx  on public.contracts(share_token);
create index contracts_created_at_idx   on public.contracts(created_at desc);

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end
$$;

create trigger contracts_set_updated_at
  before update on public.contracts
  for each row execute procedure public.set_updated_at();

-- =========================================================================
-- audit log
-- =========================================================================
create table public.contract_events (
  id           uuid primary key default gen_random_uuid(),
  contract_id  uuid not null references public.contracts(id) on delete cascade,
  event_type   text not null,
  metadata     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

create index contract_events_contract_idx on public.contract_events(contract_id);

-- =========================================================================
-- admin settings (singleton row keyed by the constant ADMIN_OWNER_ID)
-- =========================================================================
create table public.admin_settings (
  owner_id             uuid primary key,
  signature_png_path   text,
  signature_typed_name text,
  display_name         text,
  display_email        text,
  updated_at           timestamptz not null default now()
);

create trigger admin_settings_set_updated_at
  before update on public.admin_settings
  for each row execute procedure public.set_updated_at();

-- =========================================================================
-- RLS — deny everything to anon + authenticated; service role bypasses RLS
-- =========================================================================
alter table public.contracts        enable row level security;
alter table public.contract_events  enable row level security;
alter table public.admin_settings   enable row level security;

-- No policies = no access for anon/authenticated. The Next.js server uses
-- the service-role key for all reads + writes (bypassing RLS), and the
-- public signing page reads via the service-role server client too.

-- =========================================================================
-- storage buckets
-- =========================================================================
insert into storage.buckets (id, name, public)
  values
    ('signatures', 'signatures', false),
    ('signed-pdfs', 'signed-pdfs', false)
  on conflict (id) do nothing;
