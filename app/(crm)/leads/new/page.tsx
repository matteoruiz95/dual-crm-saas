import { createLead } from "@/app/actions/leads";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/form";

export default function NewLeadPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-950">Crear lead</h2>
        <p className="mt-1 text-slate-500">Registra un nuevo contacto comercial.</p>
      </div>

      <Card>
        <form action={createLead} className="grid gap-5 md:grid-cols-2">
          <Field label="Nombre">
            <Input name="name" required />
          </Field>
          <Field label="Empresa">
            <Input name="company" />
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
          <Field label="Prioridad">
            <Select name="priority" defaultValue="medium">
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </Select>
          </Field>
          <Field label="Valor estimado COP">
            <Input name="estimated_value_cop" type="number" min="0" defaultValue="0" />
          </Field>
          <Field label="Valor estimado USD">
            <Input name="estimated_value_usd" type="number" min="0" defaultValue="0" />
          </Field>
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
