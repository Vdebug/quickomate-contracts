# Quickomate, Contract Signing App

A lightweight web app for sending branded contracts to clients, capturing signatures inline, auto-generating a signed PDF, and emailing the artifact to both parties. Built with Next.js 16, Supabase, Tailwind v4, `@react-pdf/renderer`, and Resend.

## What it does

- **Admin (you):** log in with a magic link, fill out a contract per client, send it.
- **Client:** opens the email link → reviews the branded contract on a web page → signs inline (drawn signature + typed legal name + agreement checkbox).
- **System:** on submit, captures IP/UA/timestamp, renders a print-ready PDF embedding the audit trail, uploads it to Supabase Storage, and emails both parties.

The whole flow is one page from the client's perspective. PDFs are the archival artifact, the web page is the signing surface.

## Local development

### 1. Boot local Supabase (Docker required)

```bash
supabase start          # starts Postgres, Auth, Storage, Studio, Mailpit
supabase db reset       # applies the migration in supabase/migrations/
```

Useful URLs while running:

| Service | URL |
|---|---|
| App | http://localhost:3000 |
| Supabase Studio | http://127.0.0.1:54323 |
| Mailpit (catches magic-link + Resend emails sent in dev) | http://127.0.0.1:54324 |

`.env.local` is already pre-wired to the local CLI stack.

### 2. Run the app

```bash
npm run dev
```

Visit http://localhost:3000 → you'll be redirected to `/app/login`. Enter your email, then open Mailpit at http://127.0.0.1:54324 and click the magic link to authenticate.

### 3. Upload your signature

`/app/settings` → draw your signature in the canvas and save. It will auto-embed in every contract you send afterwards.

### 4. Create + send a contract

`/app/contracts/new` → fill in client + content → save → from the detail page, hit **EMAIL TO …**. In local dev (no Resend key), the email step is mocked and the share link is surfaced, copy it from the **Share link** field on the detail page.

### 5. Sign as the client

Open the share link in an incognito window → review → draw signature, type name, check agreement → submit. PDF is generated, stored, and (with Resend wired up) emailed to both parties.

## Going to production

1. Stand up a hosted Supabase project. Run the migration:
   ```bash
   supabase link --project-ref <ref>
   supabase db push
   ```
2. In Supabase Auth settings, allow your production domain in *Redirect URLs* (`https://yourdomain.com/api/auth/callback`).
3. Create a [Resend](https://resend.com) account, verify your domain, grab an API key.
4. Deploy to Vercel. Set these env vars:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_PROVIDER_NAME` / `NEXT_PUBLIC_PROVIDER_EMAIL`
   - `NEXT_PUBLIC_BASE_URL` (e.g. `https://sign.quickomate.com`)
   - `RESEND_API_KEY`
   - `RESEND_FROM` (must use your verified domain)

## Project layout

```
app/
├── layout.tsx                     # fonts + brand tokens
├── page.tsx                       # redirects to /app
├── globals.css                    # Quickomate brand tokens (Tailwind v4 @theme)
├── c/[token]/                     # PUBLIC signing page
│   ├── page.tsx
│   ├── SignForm.tsx               # signature_pad client component
│   └── thanks/page.tsx
├── app/                           # ADMIN namespace (auth required)
│   ├── layout.tsx                 # admin shell w/ nav
│   ├── page.tsx                   # dashboard
│   ├── login/                     # Supabase magic-link login
│   ├── contracts/
│   │   ├── new/                   # builder + server action
│   │   └── [id]/                  # detail + send/copy/download actions
│   └── settings/                  # signature upload (draw → PNG → storage)
└── api/
    ├── auth/callback/             # exchanges magic-link code for session
    ├── sign/                      # PUBLIC: accepts signature, generates PDF, emails
    └── contracts/[id]/
        ├── send/                  # ADMIN: sends signing email via Resend
        └── pdf/                   # ADMIN: downloads signed PDF
components/
└── ContractDocument.tsx           # the rendered contract (used in signing + admin preview)
lib/
├── supabase/{server,browser,admin}.ts
├── pdf/ContractPDF.tsx            # @react-pdf/renderer document
├── email/{ClientInvite,SignedConfirmation}.tsx
├── types.ts
└── util.ts
mockups/
├── web.html                       # original design reference for /c/[token]
└── pdf.html                       # original design reference for the PDF artifact
supabase/
├── config.toml
└── migrations/20260513211828_init_contracts.sql
```

## Notes

- **Local-only mock email mode:** if `RESEND_API_KEY` is empty, `POST /api/contracts/[id]/send` skips the API call and just marks the contract as `sent` so you can copy the link yourself.
- **Brand tokens** live in `app/globals.css` under the `@theme inline` block (Tailwind v4 style).
- **Signature evidence** stored: drawn PNG + typed legal name + IP + user-agent + timestamp. Audit log writes a row for every lifecycle event.
- **RLS:** admins only see their own contracts. The public signing page uses the service-role client server-side to read by `share_token` only, the anon role has no direct table access.
