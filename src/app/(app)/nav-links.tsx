"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Todos" },
  { href: "/categories", label: "Categories" },
  { href: "/settings", label: "Settings" },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="flex gap-1 md:flex-col">
      {links.map(({ href, label }) => {
        const active =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "text-foreground hover:bg-muted rounded-md border-l-2 border-transparent px-3 py-1.5 text-sm hover:no-underline",
              active &&
                "border-primary bg-accent text-accent-foreground font-medium",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
