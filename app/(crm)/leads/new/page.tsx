import { createLead } from "@/app/actions/leads";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/form";

export default async function NewLeadPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-950">Crear lead</h2>
        <p className="mt-1 text-slate-500">
          Registra un nuevo contacto comercial con información de negocio.
        </p>
      </div>

      <Card>
        <form action={createLead} className="grid gap-5 md:grid-cols-2">
          <Field label="Prioridad comercial">
            <Select name="lead_temperature" defaultValue="warm">
              <option value="hot">HOT</option>
              <option value="warm">WARM</option>
              <option value="cold">COLD</option>
            </Select>
          </Field>

          <Field label="Empresa">
            <Input name="company" required />
          </Field>

          <Field label="Dueño / Contacto principal">
            <Input name="owner_name" placeholder="Nombre del dueño o contacto" />
          </Field>

          <Field label="Nombre del lead">
            <Input name="name" required />
          </Field>

          <Field label="Cargo">
            <Input name="position" />
          </Field>

          <Field label="Correo">
            <Input name="email" type="email" />
          </Field>

          <Field label="Teléfono / WhatsApp">
            <Input name="phone" />
          </Field>

          <Field label="País">
            <Input name="country" defaultValue="Colombia" />
          </Field>

          <Field label="Estado / Departamento">
            <Input name="state_region" placeholder="Ej: Antioquia, Florida, Texas" />
          </Field>

          <Field label="Ciudad">
            <Input name="city" placeholder="Ej: Medellín" />
          </Field>

          <Field label="Industria">
            <Input name="industry" placeholder="Ej: Retail, logística, alimentos" />
          </Field>

          <Field label="Website">
            <Input name="website_url" placeholder="https://empresa.com" />
          </Field>

          <Field label="Instagram">
            <Input name="instagram_url" placeholder="@empresa o URL del perfil" />
          </Field>

          <Field label="Servicio inicial">
            <Input name="initial_service" placeholder="Ej: CRM, IA, Power BI, Power Apps" />
          </Field>

          <Field label="Prioridad operativa">
            <Select name="priority" defaultValue="medium">
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
              defaultValue="0"
            />
          </Field>

          <Field label="Valor estimado USD">
            <Input
              name="estimated_value_usd"
              type="number"
              min="0"
              defaultValue="0"
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Dolor probable">
              <Textarea
                name="probable_pain"
                placeholder="Describe la necesidad, problema o dolor probable del cliente."
              />
            </Field>
          </div>

          <div className="md:col-span-2">
            <Field label="Observaciones">
              <Textarea name="observations" />
            </Field>
          </div>

          <div className="md:col-span-2">
            <Button type="submit">Guardar lead</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}