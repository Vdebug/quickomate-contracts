import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-[420px]">
        <div className="qm-mono-label mb-3">// QUICKOMATE / CONTRACTS</div>
        <h1 className="text-4xl font-bold tracking-tight leading-tight mb-2">Log in.</h1>
        <p className="font-serif text-lg text-[#333] mb-8">
          Enter the admin password to manage contracts.
        </p>
        <LoginForm next={next} />
        {error && (
          <div className="mt-4 border border-[var(--qm-accent)] bg-[var(--qm-accent)]/10 px-4 py-3 text-sm text-[var(--qm-accent)]">
            Login failed.
          </div>
        )}
      </div>
    </main>
  );
}
