import Link from "next/link";
import { notFound } from "next/navigation";
import { updateLeadDetails } from "@/app/actions/leads";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { createClient } from "@/lib/supabase/server";

export default async function EditLeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: lead, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !lead) {
    notFound();
  }

  async function updateLeadAction(formData: FormData) {
    "use server";
    await updateLeadDetails(id, formData);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-950">Editar lead</h2>
          <p className="mt-1 text-slate-500">
            Actualiza la información comercial y de contacto del lead.
          </p>
        </div>

        <Link
          href={`/leads/${lead.id}`}
          className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
        >
          Volver al detalle
        </Link>
      </div>

      <Card>
        <form action={updateLeadAction} className="grid gap-5 md:grid-cols-2">
          <Field label="Prioridad comercial">
            <Select
              name="lead_temperature"
              defaultValue={lead.lead_temperature || "warm"}
            >
              <option value="hot">HOT</option>
              <option value="warm">WARM</option>
              <option value="cold">COLD</option>
            </Select>
          </Field>

          <Field label="Empresa">
            <Input name="company" defaultValue={lead.company || ""} />
          </Field>

          <Field label="Dueño / Contacto principal">
            <Input
              name="owner_name"
              defaultValue={lead.owner_name || ""}
              placeholder="Nombre del dueño o contacto"
            />
          </Field>

          <Field label="Nombre del lead">
            <Input name="name" required defaultValue={lead.name || ""} />
          </Field>

          <Field label="Cargo">
            <Input name="position" defaultValue={lead.position || ""} />
          </Field>

          <Field label="Correo">
            <Input name="email" type="email" defaultValue={lead.email || ""} />
          </Field>

          <Field label="Teléfono / WhatsApp">
            <Input name="phone" defaultValue={lead.phone || ""} />
          </Field>

          <Field label="País">
            <Input name="country" defaultValue={lead.country || "Colombia"} />
          </Field>

          <Field label="Estado / Departamento">
            <Input
              name="state_region"
              defaultValue={lead.state_region || ""}
              placeholder="Ej: Antioquia, Florida, Texas"
            />
          </Field>

          <Field label="Ciudad">
            <Input
              name="city"
              defaultValue={lead.city || ""}
              placeholder="Ej: Medellín"
            />
          </Field>

          <Field label="Industria">
            <Input
              name="industry"
              defaultValue={lead.industry || ""}
              placeholder="Ej: Retail, logística, alimentos"
            />
          </Field>

          <Field label="Website">
            <Input
              name="website_url"
              defaultValue={lead.website_url || ""}
              placeholder="https://empresa.com"
            />
          </Field>

          <Field label="Instagram">
            <Input
              name="instagram_url"
              defaultValue={lead.instagram_url || ""}
              placeholder="@empresa o URL del perfil"
            />
          </Field>

          <Field label="Servicio inicial">
            <Input
              name="initial_service"
              defaultValue={lead.initial_service || ""}
              placeholder="Ej: CRM, IA, Power BI, Power Apps"
            />
          </Field>

          <Field label="Prioridad operativa">
            <Select name="priority" defaultValue={lead.priority || "medium"}>
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </Select>
          </Field>

          <Field label="Valor estimado COP">
            <Input
              name="estimated_value_cop"
              type="number"
              min="0"
              defaultValue={lead.estimated_value_cop || 0}
            />
          </Field>

          <Field label="Valor estimado USD">
            <Input
              name="estimated_value_usd"
              type="number"
              min="0"
              defaultValue={lead.estimated_value_usd || 0}
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Dolor probable">
              <Textarea
                name="probable_pain"
                defaultValue={lead.probable_pain || ""}
                placeholder="Describe la necesidad, problema o dolor probable del cliente."
              />
            </Field>
          </div>

          <div className="md:col-span-2">
            <Field label="Observaciones">
              <Textarea
                name="observations"
                defaultValue={lead.observations || ""}
              />
            </Field>
          </div>

          <div className="flex flex-col gap-3 md:col-span-2 md:flex-row md:justify-end">
            <Link
              href={`/leads/${lead.id}`}
              className="rounded-xl bg-slate-100 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              Cancelar
            </Link>

            <Button type="submit">Guardar cambios</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}