"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookMarked } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const pathname = usePathname();
  // The chapter workspace has its own full-bleed chrome — hide the global header there.
  if (pathname?.startsWith("/project/")) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-content items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-white">
            <BookMarked className="h-4 w-4" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            Book Studio AI
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <NavLink href="/pricing" active={pathname === "/pricing"}>
            Pricing
          </NavLink>
          <NavLink href="/dashboard" active={pathname === "/dashboard"}>
            Dashboard
          </NavLink>
          <Link href="/builder">
            <Button size="sm" className="ml-1">
              Start My Book
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
        active ? "text-ink" : "text-subtle hover:text-ink"
      )}
    >
      {children}
    </Link>
  );
}
