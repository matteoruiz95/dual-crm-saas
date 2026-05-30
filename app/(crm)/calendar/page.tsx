import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";

export default async function CalendarPage() {
  const supabase = await createClient();
  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, status, due_at")
    .not("due_at", "is", null)
    .order("due_at", { ascending: true })
    .limit(50);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-950">Calendario</h2>
        <p className="mt-1 text-slate-500">Próximas tareas y seguimientos comerciales.</p>
      </div>
      <div className="grid gap-4">
        {tasks?.map((task) => (
          <Card key={task.id}>
            <div className="font-semibold text-slate-950">{task.title}</div>
            <div className="mt-1 text-sm text-slate-500">{task.status} · {formatDateTime(task.due_at)}</div>
          </Card>
        ))}
        {!tasks?.length && <Card>No hay tareas con fecha.</Card>}
      </div>
    </div>
  );
}
