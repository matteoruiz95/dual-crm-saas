export type AppRole = "admin" | "commercial_lead" | "seller";
export type LeadStage = "lead" | "prospect" | "client";
export type LeadStatus = "new" | "contacted" | "meeting_scheduled" | "proposal_sent" | "negotiation" | "won" | "lost";
export type TaskType = "call" | "email" | "meeting" | "proposal" | "follow_up";
export type TaskStatus = "pending" | "in_progress" | "completed" | "overdue" | "cancelled";
export type PriorityLevel = "low" | "medium" | "high";

export type LeadListItem = {
  id: string;
  name: string;
  company: string | null;
  position: string | null;
  email: string | null;
  phone: string | null;
  stage: LeadStage;
  status: LeadStatus;
  priority: PriorityLevel;
  estimated_value_cop: number | null;
  estimated_value_usd: number | null;
  created_at: string;
  next_action_at: string | null;
  responsible_user_id: string;
};
