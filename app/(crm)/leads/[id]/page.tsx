import Link from "next/link";
import { notFound } from "next/navigation";
import { updateLeadStatus } from "@/app/actions/leads";
import { createTask } from "@/app/actions/tasks";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { LEAD_STATUS, TASK_TYPES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { currency, formatDateTime } from "@/lib/utils";
import type { LeadStatus } from "@/types/crm";

type ResponsibleProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
};

function getResponsible(
  responsible: ResponsibleProfile | ResponsibleProfile[] | null
) {
  if (Array.isArray(responsible)) {
    return responsible[0] ?? null;
  }

  return responsible;
}

function getTemperatureLabel(value: string | null) {
  const temperature = (value || "warm").toLowerCase();

  if (temperature === "hot") return "HOT";
  if (temperature === "cold") return "COLD";
  return "WARM";
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: lead } = await supabase
    .from("leads")
    .select(`
      *,
      responsible:profiles!leads_responsible_user_id_fkey (
        id,
        full_name,
        email,
        role
      )
    `)
    .eq("id", id)
    .single();

  if (!lead) notFound();

  const responsible = getResponsible(lead.responsible);

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, type, status, due_at, priority")
    .eq("lead_id", id)
    .order("due_at", { ascending: true });

  const { data: events } = await supabase
    .from("lead_events")
    .select("id, event_type, description, created_at")
    .eq("lead_id", id)
    .order("created_at", { ascending: false })
    .limit(20);

  async function changeStatus(formData: FormData) {
    "use server";
    const status = String(formData.get("status")) as LeadStatus;
    await updateLeadStatus(id, status);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-950">{lead.name}</h2>
          <p className="mt-1 text-slate-500">
            {lead.company || "Sin empresa"} · {lead.position || "Sin cargo"}
          </p>
        </div>

        <form action={changeStatus} className="flex gap-2">
          <Select name="status" defaultValue={lead.status}>
            {LEAD_STATUS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </Select>

          <Button type="submit">Cambiar estado</Button>
        </form>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Información general</CardTitle>

            <Link
              href={`/leads/${lead.id}/edit`}
              className="rounded-xl bg-dual-purple px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Editar
            </Link>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Info
              label="Prioridad comercial"
              value={getTemperatureLabel(lead.lead_temperature)}
            />

            <Info label="Correo" value={lead.email || "Sin correo"} />
            <Info label="Teléfono" value={lead.phone || "Sin teléfono"} />

            <Info
              label="Responsable"
              value={responsible?.full_name || "Sin responsable"}
            />

            <Info
              label="Correo responsable"
              value={responsible?.email || "Sin correo"}
            />

            <Info label="Etapa" value={lead.stage} />

            <Info
              label="Estado"
              value={
                LEAD_STATUS.find((item) => item.value === lead.status)?.label ??
                lead.status
              }
            />

            <Info
              label="Valor estimado COP"
              value={currency(Number(lead.estimated_value_cop ?? 0), "COP")}
            />

            <Info
              label="Valor estimado USD"
              value={currency(Number(lead.estimated_value_usd ?? 0), "USD")}
            />

            <Info
              label="Dueño / Contacto principal"
              value={lead.owner_name || "Sin dueño"}
            />

            <Info label="País" value={lead.country || "Sin país"} />

            <Info
              label="Estado / Departamento"
              value={lead.state_region || "Sin estado"}
            />

            <Info label="Ciudad" value={lead.city || "Sin ciudad"} />

            <Info
              label="Industria"
              value={lead.industry || "Sin industria"}
            />

            <Info
              label="Website"
              value={lead.website_url || "Sin website"}
            />

            <Info
              label="Instagram"
              value={lead.instagram_url || "Sin Instagram"}
            />

            <Info
              label="Servicio inicial"
              value={lead.initial_service || "Sin servicio inicial"}
            />
          </div>

          {lead.probable_pain && (
            <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm text-red-800">
              <div className="mb-1 font-semibold">Dolor probable</div>
              {lead.probable_pain}
            </div>
          )}

          {lead.observations && (
            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
              <div className="mb-1 font-semibold text-slate-900">
                Observaciones
              </div>
              {lead.observations}
            </div>
          )}
        </Card>

        <Card>
          <CardTitle>Crear tarea</CardTitle>

          <form action={createTask} className="mt-4 space-y-4">
            <input type="hidden" name="lead_id" value={lead.id} />

            <Field label="Título">
              <Input name="title" required />
            </Field>

            <Field label="Tipo">
              <Select name="type" defaultValue="follow_up">
                {TASK_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Fecha">
                <Input name="due_date" type="date" />
              </Field>

              <Field label="Hora">
                <Input name="due_time" type="time" defaultValue="09:00" />
              </Field>
            </div>

            <Field label="Descripción">
              <Textarea name="description" />
            </Field>

            <Button type="submit" className="w-full">
              Agregar tarea
            </Button>
          </form>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardTitle>Tareas</CardTitle>

          <div className="mt-4 space-y-3">
            {tasks?.map((task) => (
              <div
                key={task.id}
                className="rounded-2xl border border-slate-100 p-4"
              >
                <div className="font-semibold text-slate-950">
                  {task.title}
                </div>

                <div className="mt-1 text-sm text-slate-500">
                  {task.status} · {formatDateTime(task.due_at)}
                </div>
              </div>
            ))}

            {!tasks?.length && (
              <p className="text-sm text-slate-500">
                Este lead todavía no tiene tareas.
              </p>
            )}
          </div>
        </Card>

        <Card>
          <CardTitle>Timeline</CardTitle>

          <div className="mt-4 space-y-3">
            {events?.map((event) => (
              <div
                key={event.id}
                className="rounded-2xl border border-slate-100 p-4"
              >
                <div className="font-semibold text-slate-950">
                  {event.description}
                </div>

                <div className="mt-1 text-sm text-slate-500">
                  {formatDateTime(event.created_at)}
                </div>
              </div>
            ))}

            {!events?.length && (
              <p className="text-sm text-slate-500">
                Sin eventos registrados.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="mt-1 font-medium text-slate-900">{value}</div>
    </div>
  );
}