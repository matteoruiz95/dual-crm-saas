"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import type { LeadStatus } from "@/types/crm";

export async function createLead(formData: FormData) {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const payload = {
    tenant_id: profile.tenant_id,
    name: String(formData.get("name") || ""),
    company: String(formData.get("company") || "") || null,
    position: String(formData.get("position") || "") || null,
    email: String(formData.get("email") || "") || null,
    phone: String(formData.get("phone") || "") || null,
    status: "new",
    stage: "lead",
    priority: String(formData.get("priority") || "medium"),
    estimated_value_cop: Number(formData.get("estimated_value_cop") || 0),
    estimated_value_usd: Number(formData.get("estimated_value_usd") || 0),
    responsible_user_id: profile.id,
    created_by: profile.id,
    observations: String(formData.get("observations") || "") || null,
  };

  const { data, error } = await supabase.from("leads").insert(payload).select("id").single();

  if (error) throw new Error(error.message);

  await supabase.from("lead_events").insert({
    tenant_id: profile.tenant_id,
    lead_id: data.id,
    event_type: "lead_created",
    description: "Lead creado",
    created_by: profile.id,
  });

  revalidatePath("/leads");
  redirect(`/leads/${data.id}`);
}

export async function updateLeadStatus(leadId: string, nextStatus: LeadStatus) {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const { data: current, error: currentError } = await supabase
    .from("leads")
    .select("id, status, stage")
    .eq("id", leadId)
    .single();

  if (currentError) throw new Error(currentError.message);

  const nextStage = nextStatus === "won" ? "client" : nextStatus === "lost" ? current.stage : nextStatus === "new" || nextStatus === "contacted" ? "lead" : "prospect";

  const { error } = await supabase
    .from("leads")
    .update({
      status: nextStatus,
      stage: nextStage,
      converted_to_client_at: nextStatus === "won" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", leadId);

  if (error) throw new Error(error.message);

  await supabase.from("lead_status_history").insert({
    tenant_id: profile.tenant_id,
    lead_id: leadId,
    previous_status: current.status,
    new_status: nextStatus,
    previous_stage: current.stage,
    new_stage: nextStage,
    changed_by: profile.id,
  });

  await supabase.from("lead_events").insert({
    tenant_id: profile.tenant_id,
    lead_id: leadId,
    event_type: "status_changed",
    description: `Estado actualizado a ${nextStatus}`,
    created_by: profile.id,
  });

  if (nextStatus === "proposal_sent") {
    const dueAt = new Date();
    dueAt.setDate(dueAt.getDate() + 2);

    await supabase.from("tasks").insert({
      tenant_id: profile.tenant_id,
      lead_id: leadId,
      title: "Hacer seguimiento a la propuesta enviada",
      type: "follow_up",
      status: "pending",
      priority: "medium",
      due_at: dueAt.toISOString(),
      responsible_user_id: profile.id,
      created_by: profile.id,
    });
  }

  revalidatePath("/leads");
  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/pipeline");
}
