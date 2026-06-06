"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import type { LeadStatus } from "@/types/crm";

function getText(formData: FormData, key: string) {
  const value = String(formData.get(key) || "").trim();
  return value || null;
}

function getNumber(formData: FormData, key: string) {
  const value = Number(formData.get(key) || 0);
  return Number.isNaN(value) ? 0 : value;
}

function getLeadTemperature(formData: FormData) {
  const value = String(formData.get("lead_temperature") || "warm").trim();

  if (["hot", "warm", "cold"].includes(value)) {
    return value;
  }

  return "warm";
}

export async function createLead(formData: FormData) {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const payload = {
    tenant_id: profile.tenant_id,

    // Datos principales
    name: String(formData.get("name") || "").trim(),
    company: getText(formData, "company"),
    position: getText(formData, "position"),
    email: getText(formData, "email"),
    phone: getText(formData, "phone"),

    // Nuevos datos comerciales / prospección
    country: getText(formData, "country"),
    state_region: getText(formData, "state_region"),
    city: getText(formData, "city"),
    industry: getText(formData, "industry"),
    website_url: getText(formData, "website_url"),
    instagram_url: getText(formData, "instagram_url"),
    owner_name: getText(formData, "owner_name"),
    probable_pain: getText(formData, "probable_pain"),
    initial_service: getText(formData, "initial_service"),
    lead_temperature: getLeadTemperature(formData),

    // Estado interno del CRM
    status: "new",
    stage: "lead",
    priority: String(formData.get("priority") || "medium"),

    // Valores estimados
    estimated_value_cop: getNumber(formData, "estimated_value_cop"),
    estimated_value_usd: getNumber(formData, "estimated_value_usd"),

    // Responsable automático
    responsible_user_id: profile.id,
    created_by: profile.id,

    // Observaciones generales
    observations: getText(formData, "observations"),
  };

  if (!payload.name) {
    throw new Error("El nombre del lead es obligatorio.");
  }

  const { data, error } = await supabase
    .from("leads")
    .insert(payload)
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await supabase.from("lead_events").insert({
    tenant_id: profile.tenant_id,
    lead_id: data.id,
    event_type: "lead_created",
    description: "Lead creado",
    created_by: profile.id,
  });

  revalidatePath("/leads");
  revalidatePath("/pipeline");

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

  const nextStage =
    nextStatus === "won"
      ? "client"
      : nextStatus === "lost"
        ? current.stage
        : nextStatus === "new" || nextStatus === "contacted"
          ? "lead"
          : "prospect";

  const { error } = await supabase
    .from("leads")
    .update({
      status: nextStatus,
      stage: nextStage,
      converted_to_client_at:
        nextStatus === "won" ? new Date().toISOString() : null,
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

export async function updateLeadDetails(leadId: string, formData: FormData) {
  const supabase = await createClient();

  function getText(key: string) {
    const value = String(formData.get(key) || "").trim();
    return value || null;
  }

  function getNumber(key: string) {
    const value = Number(formData.get(key) || 0);
    return Number.isNaN(value) ? 0 : value;
  }

  function getLeadTemperature() {
    const value = String(formData.get("lead_temperature") || "warm").trim();

    if (["hot", "warm", "cold"].includes(value)) {
      return value;
    }

    return "warm";
  }

  const payload = {
    name: String(formData.get("name") || "").trim(),
    company: getText("company"),
    position: getText("position"),
    email: getText("email"),
    phone: getText("phone"),

    country: getText("country"),
    state_region: getText("state_region"),
    city: getText("city"),
    industry: getText("industry"),
    website_url: getText("website_url"),
    instagram_url: getText("instagram_url"),
    owner_name: getText("owner_name"),
    probable_pain: getText("probable_pain"),
    initial_service: getText("initial_service"),
    lead_temperature: getLeadTemperature(),

    priority: String(formData.get("priority") || "medium"),
    estimated_value_cop: getNumber("estimated_value_cop"),
    estimated_value_usd: getNumber("estimated_value_usd"),
    observations: getText("observations"),

    updated_at: new Date().toISOString(),
  };

  if (!payload.name) {
    throw new Error("El nombre del lead es obligatorio.");
  }

  const { error } = await supabase
    .from("leads")
    .update(payload)
    .eq("id", leadId);

  if (error) throw new Error(error.message);

  const profile = await getCurrentProfile();

  await supabase.from("lead_events").insert({
    tenant_id: profile.tenant_id,
    lead_id: leadId,
    event_type: "lead_updated",
    description: "Información del lead actualizada",
    created_by: profile.id,
  });

  revalidatePath("/leads");
  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/pipeline");

  redirect(`/leads/${leadId}`);
}