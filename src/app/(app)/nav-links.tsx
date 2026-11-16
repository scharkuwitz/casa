"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Ажлууд" },
  { href: "/categories", label: "Ангилал" },
  { href: "/settings", label: "Тохиргоо" },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="Үндсэн цэс" className="flex gap-4 md:flex-col md:gap-0.5">
      {links.map(({ href, label }) => {
        const active =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "text-muted-foreground hover:text-foreground border-l-2 border-transparent py-1 text-sm hover:no-underline md:pl-2.5",
              active && "border-primary text-foreground font-semibold",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
