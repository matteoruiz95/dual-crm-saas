import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBogotaDayRangeUtc } from "@/lib/time/bogota";
import { sendDailyTaskReminder } from "@/lib/whatsapp/send-whatsapp";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}` && !request.headers.get("x-vercel-cron")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { bogotaDate, startUtc, endUtc } = getBogotaDayRangeUtc();

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("id, title, due_at, tenant_id, responsible_user_id, profiles!tasks_responsible_user_id_fkey(id, full_name, phone, tenant_id), leads(name, company)")
    .in("status", ["pending", "in_progress"])
    .gte("due_at", startUtc)
    .lte("due_at", endUtc);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const grouped = new Map<string, any[]>();

  for (const task of tasks ?? []) {
    if (!task.responsible_user_id) continue;
    const key = task.responsible_user_id;
    grouped.set(key, [...(grouped.get(key) ?? []), task]);
  }

  const results = [];

  for (const [userId, userTasks] of grouped.entries()) {
    const first = userTasks[0];
    const profile = Array.isArray(first.profiles) ? first.profiles[0] : first.profiles;

    if (!profile?.phone) {
      results.push({ userId, skipped: true, reason: "User has no phone" });
      continue;
    }

    const body = userTasks
      .map((task, index) => {
        const leadName = Array.isArray(task.leads) ? task.leads[0]?.name : task.leads?.name;
        const company = Array.isArray(task.leads) ? task.leads[0]?.company : task.leads?.company;
        return `${index + 1}. ${task.title} - ${leadName ?? "Sin lead"}${company ? ` (${company})` : ""}`;
      })
      .join("\n");

    const message = `Estas son tus tareas comerciales para hoy:\n${body}`;
    const sendResult = await sendDailyTaskReminder({
      to: profile.phone,
      userName: profile.full_name,
      message,
    });

    await supabase.from("whatsapp_reminder_logs").insert({
      tenant_id: profile.tenant_id,
      user_id: userId,
      reminder_date: bogotaDate,
      message_body: message,
      status: sendResult.ok ? "sent" : "error",
      provider_message_id: sendResult.providerMessageId,
      error_message: sendResult.error,
      sent_at: sendResult.ok ? new Date().toISOString() : null,
    });

    results.push({ userId, sent: sendResult.ok, error: sendResult.error });
  }

  return NextResponse.json({ ok: true, date: bogotaDate, users: results.length, results });
}
