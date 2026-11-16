import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto mt-20 w-full max-w-sm px-4">
      <h1 className="mb-1 border-0 pb-0 text-xl">Вектор календар</h1>
      <p className="text-muted-foreground mb-5 text-sm">
        Ажлын төлөвлөгөө, явцын хяналтын самбар
      </p>
      <LoginForm />
    </main>
  );
}
