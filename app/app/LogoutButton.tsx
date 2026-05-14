"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const onClick = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/app/login");
    router.refresh();
  };
  return (
    <button onClick={onClick} className="qm-mono-label hover:text-[var(--qm-accent)] cursor-pointer">
      LOG OUT
    </button>
  );
}
