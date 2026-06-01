export const LEAD_STATUS = [
  { value: "new", label: "Nuevo" },
  { value: "contacted", label: "Contactado" },
  { value: "meeting_scheduled", label: "Reunión agendada" },
  { value: "proposal_sent", label: "Propuesta enviada" },
  { value: "negotiation", label: "Negociación" },
  { value: "won", label: "Ganado" },
  { value: "lost", label: "Perdido" },
] as const;

export const TASK_TYPES = [
  { value: "call", label: "Llamar" },
  { value: "email", label: "Enviar correo" },
  { value: "meeting", label: "Agendar reunión" },
  { value: "proposal", label: "Enviar propuesta" },
  { value: "follow_up", label: "Hacer seguimiento" },
] as const;

export const TASK_STATUS = [
  { value: "pending", label: "Pendiente" },
  { value: "in_progress", label: "En progreso" },
  { value: "completed", label: "Completada" },
  { value: "overdue", label: "Vencida" },
  { value: "cancelled", label: "Cancelada" },
] as const;

export const MENU_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/leads", label: "Leads" },
  { href: "/prospects", label: "Prospectos" },
  { href: "/clients", label: "Clientes" },
  { href: "/tasks", label: "Tareas" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/calendar", label: "Calendario" },
  { href: "/reports", label: "Reportes" },
  { href: "/settings", label: "Configuración" },
  {href: "/profile", label: "Mi perfil"}
] as const;
