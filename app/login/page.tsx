import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-dual-black p-6">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-soft">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-dual-purple">Dual Taskia</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Ingresar al CRM</h1>
          <p className="mt-2 text-sm text-slate-500">Gestiona leads, tareas, pipeline y clientes.</p>
        </div>
        <LoginForm />
      </section>
    </main>
  );
}
