import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto mt-24 w-full max-w-sm px-4">
      <p className="font-heading mb-1 text-center text-3xl">Case</p>
      <p className="text-muted-foreground mb-5 text-center text-sm">
        Sign in to continue
      </p>
      <LoginForm />
    </main>
  );
}
