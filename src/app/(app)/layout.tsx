import Link from "next/link";
import { requireSession } from "@/lib/session";
import { NavLinks } from "./nav-links";
import { SignOutButton } from "./sign-out-button";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  return (
    <>
      <header className="border-b">
        <div className="mx-auto flex h-11 max-w-6xl items-center gap-3 px-4">
          <Link
            href="/"
            className="text-foreground flex items-baseline gap-3 hover:no-underline"
          >
            <span className="font-heading text-base font-semibold">
              Вектор календар
            </span>
            <span className="text-muted-foreground hidden text-xs md:inline">
              Ажлын төлөвлөгөө, явцын хяналтын самбар
            </span>
          </Link>
          <div className="flex-1" />
          <span className="text-muted-foreground hidden text-xs sm:inline">
            {session.user.email}
          </span>
          <SignOutButton />
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-3 px-4 py-4 md:flex-row md:gap-8">
        <aside className="md:w-36 md:shrink-0">
          <NavLinks />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </>
  );
}
