import { Card, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: profiles } = await supabase.from("profiles").select("id, full_name, email, role, is_active").order("created_at", { ascending: false });
  const { data: sources } = await supabase.from("lead_sources").select("id, name, is_active").order("name");
  const { data: services } = await supabase.from("services").select("id, name, is_active").order("name");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-950">Configuración</h2>
        <p className="mt-1 text-slate-500">Usuarios, canales de origen y servicios de interés.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardTitle>Usuarios</CardTitle>
          <div className="mt-4 space-y-3">
            {profiles?.map((user) => <div key={user.id} className="rounded-xl bg-slate-50 p-3"><div className="font-medium">{user.full_name}</div><div className="text-sm text-slate-500">{user.email} · {user.role}</div></div>)}
          </div>
        </Card>
        <Card>
          <CardTitle>Canales de origen</CardTitle>
          <div className="mt-4 space-y-3">
            {sources?.map((item) => <div key={item.id} className="rounded-xl bg-slate-50 p-3 font-medium">{item.name}</div>)}
          </div>
        </Card>
        <Card>
          <CardTitle>Servicios</CardTitle>
          <div className="mt-4 space-y-3">
            {services?.map((item) => <div key={item.id} className="rounded-xl bg-slate-50 p-3 font-medium">{item.name}</div>)}
          </div>
        </Card>
      </div>
    </div>
  );
}
