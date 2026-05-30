import { completeTask } from "@/app/actions/tasks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";

export default async function TasksPage() {
  const supabase = await createClient();
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("id, title, type, status, due_at, priority, leads(id, name, company)")
    .order("due_at", { ascending: true });

  if (error) throw new Error(error.message);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-950">Tareas</h2>
        <p className="mt-1 text-slate-500">Seguimientos, llamadas, correos, propuestas y reuniones.</p>
      </div>

      <div className="grid gap-4">
        {tasks?.map((task) => (
          <Card key={task.id} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-semibold text-slate-950">{task.title}</div>
              <div className="mt-1 text-sm text-slate-500">{task.status} · {formatDateTime(task.due_at)}</div>
            </div>
            {task.status !== "completed" && (
              <form action={async () => { "use server"; await completeTask(task.id); }}>
                <Button type="submit" variant="secondary">Completar</Button>
              </form>
            )}
          </Card>
        ))}
        {!tasks?.length && <Card>No hay tareas registradas.</Card>}
      </div>
    </div>
  );
}
