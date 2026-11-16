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
      <header className="bg-card sticky top-0 z-10 border-b">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
          <Link
            href="/"
            className="font-heading text-foreground text-xl tracking-tight hover:no-underline"
          >
            Case
            <span className="text-muted-foreground ml-2 hidden font-sans text-xs tracking-normal sm:inline">
              The free-form planner
            </span>
          </Link>
          <div className="flex-1" />
          <span className="text-muted-foreground hidden text-sm sm:inline">
            {session.user.email}
          </span>
          <SignOutButton />
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 px-4 py-6 md:flex-row md:gap-8">
        <aside className="md:w-44 md:shrink-0">
          <p className="text-muted-foreground mb-1 hidden px-3 text-xs font-semibold tracking-wider uppercase md:block">
            Navigation
          </p>
          <NavLinks />
        </aside>
        <main className="bg-card shadow-card min-w-0 flex-1 rounded-xl border p-6 md:p-8">
          {children}
        </main>
      </div>
    </>
  );
}
