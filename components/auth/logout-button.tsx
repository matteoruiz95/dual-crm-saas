"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

type LogoutButtonProps = {
  className?: string;
};

export function LogoutButton({ className }: LogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);

    const supabase = createClient();
    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={cn(
        "rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-60",
        "bg-red-50 text-red-700 hover:bg-red-100",
        className
      )}
    >
      {loading ? "Cerrando..." : "Cerrar sesión"}
    </button>
  );
}