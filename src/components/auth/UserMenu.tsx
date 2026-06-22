"use client";
// Header session control: a "Sign in" button for visitors, or an avatar with a
// small menu (Dashboard / Sign out) once authenticated. Renders nothing while
// the session is resolving to avoid a flash of the wrong state.
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { LayoutDashboard, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export function UserMenu({ className }: { className?: string }) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (status === "loading") {
    return <div className={cn("h-9 w-9 animate-pulse rounded-full bg-line/60", className)} />;
  }

  if (!session?.user) {
    return (
      <button
        type="button"
        onClick={() => signIn("google")}
        className={cn(
          "rounded-lg px-3 py-2 text-sm font-medium text-subtle transition-colors hover:text-ink",
          className
        )}
      >
        Sign in
      </button>
    );
  }

  const { name, email, image } = session.user;
  const initial = (name ?? email ?? "?").charAt(0).toUpperCase();

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-line bg-brand-gradient text-sm font-semibold text-white shadow-soft"
      >
        {image ? (
          <Image src={image} alt="" width={36} height={36} className="h-full w-full object-cover" />
        ) : (
          initial
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-line bg-canvas shadow-book">
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-sm font-medium text-ink">{name ?? "Signed in"}</p>
            {email && <p className="truncate text-xs text-subtle">{email}</p>}
          </div>
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink/80 hover:bg-indigo-soft hover:text-indigo"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink/80 hover:bg-indigo-soft hover:text-indigo"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-ink/80 hover:bg-indigo-soft hover:text-indigo"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
