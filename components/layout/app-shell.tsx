import Link from "next/link";
import { MENU_ITEMS } from "@/lib/constants";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  return (
    <div className="min-h-screen bg-dual-soft">
      {/* Menú lateral escritorio */}
      <aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-slate-200 bg-dual-black p-5 text-white lg:block">
        <div className="mb-8">
          <div className="text-2xl font-bold tracking-tight">Dual Taskia</div>
          <div className="text-sm text-slate-300">CRM SaaS</div>
        </div>

        <nav className="space-y-1">
          {MENU_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur lg:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-dual-purple">
                CRM Comercial
              </p>
              <h1 className="text-lg font-semibold text-slate-950 lg:text-xl">
                Panel de gestión
              </h1>
            </div>

            <div className="text-right">
              <div className="text-sm font-semibold text-slate-900">
                {profile.full_name}
              </div>
              <div className="text-xs text-slate-500">{profile.role}</div>
            </div>
          </div>

          {/* Menú móvil */}
          <details className="mt-4 lg:hidden">
            <summary className="cursor-pointer list-none rounded-xl bg-dual-black px-4 py-3 text-center text-sm font-semibold text-white">
              Menú
            </summary>

            <nav className="mt-3 grid gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              {MENU_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </details>
        </header>

        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}