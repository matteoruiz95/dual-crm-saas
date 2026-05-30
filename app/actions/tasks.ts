"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";

export async function createTask(formData: FormData) {
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  const leadId = String(formData.get("lead_id"));

  const dueDate = String(formData.get("due_date") || "");
  const dueTime = String(formData.get("due_time") || "09:00");
  const dueAt = dueDate ? new Date(`${dueDate}T${dueTime}:00-05:00`).toISOString() : null;

  const payload = {
    tenant_id: profile.tenant_id,
    lead_id: leadId,
    title: String(formData.get("title") || ""),
    description: String(formData.get("description") || "") || null,
    type: String(formData.get("type") || "follow_up"),
    status: "pending",
    priority: String(formData.get("priority") || "medium"),
    due_at: dueAt,
    responsible_user_id: profile.id,
    created_by: profile.id,
  };

  const { error } = await supabase.from("tasks").insert(payload);
  if (error) throw new Error(error.message);

  await supabase.from("lead_events").insert({
    tenant_id: profile.tenant_id,
    lead_id: leadId,
    event_type: "task_created",
    description: `Tarea creada: ${payload.title}`,
    created_by: profile.id,
  });

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/tasks");
}

export async function completeTask(taskId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("tasks")
    .update({ status: "completed", completed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", taskId);

  if (error) throw new Error(error.message);

  revalidatePath("/tasks");
}
