"use client";

import { useTransition } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { signOutAction } from "@/app/auth/actions";
import { cn } from "@/lib/utils";

interface LogoutButtonProps {
  className?: string;
}

/**
 * Botón "Salir" del sidebar de dashboards.
 * Llama a signOutAction y desactiva el botón durante el logout.
 */
export function LogoutButton({ className }: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await signOutAction();
    });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className={cn(
        "flex items-center gap-2.5 px-2.5 py-2 rounded text-sm text-muted hover:bg-paper hover:text-ink w-full text-left disabled:opacity-50 disabled:pointer-events-none",
        className
      )}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
      <span>{isPending ? "Saliendo…" : "Salir"}</span>
    </button>
  );
}
