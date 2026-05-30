-- =====================================================
-- DUAL TASKIA CRM SAAS - MVP DATABASE MODEL
-- Supabase PostgreSQL
-- =====================================================

create extension if not exists "pgcrypto";

-- =========================
-- ENUMS
-- =========================

do $$ begin
  create type app_role as enum ('admin', 'commercial_lead', 'seller');
exception when duplicate_object then null; end $$;

do $$ begin
  create type lead_stage as enum ('lead', 'prospect', 'client');
exception when duplicate_object then null; end $$;

do $$ begin
  create type lead_status as enum ('new', 'contacted', 'meeting_scheduled', 'proposal_sent', 'negotiation', 'won', 'lost');
exception when duplicate_object then null; end $$;

do $$ begin
  create type task_type as enum ('call', 'email', 'meeting', 'proposal', 'follow_up');
exception when duplicate_object then null; end $$;

do $$ begin
  create type task_status as enum ('pending', 'in_progress', 'completed', 'overdue', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type priority_level as enum ('low', 'medium', 'high');
exception when duplicate_object then null; end $$;

-- =========================
-- TABLES
-- =========================

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  nit text,
  country text default 'Colombia',
  city text,
  phone text,
  email text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.tenants is 'Empresas que usan el CRM SaaS. Cada tenant representa una empresa cliente.';

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  role app_role not null default 'seller',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'Usuarios del sistema asociados a una empresa/tenant. Define rol, nombre y datos de contacto.';

create table if not exists public.lead_sources (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (tenant_id, name)
);

comment on table public.lead_sources is 'Canales de origen del lead, por ejemplo LinkedIn, WhatsApp, referido, página web o evento.';

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (tenant_id, name)
);

comment on table public.services is 'Servicios de interés que puede seleccionar el vendedor al crear un lead.';

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  company text,
  position text,
  email text,
  phone text,
  source_id uuid references public.lead_sources(id),
  service_id uuid references public.services(id),
  stage lead_stage not null default 'lead',
  status lead_status not null default 'new',
  priority priority_level not null default 'medium',
  estimated_value_cop numeric(18,2) default 0,
  estimated_value_usd numeric(18,2) default 0,
  responsible_user_id uuid not null references public.profiles(id),
  created_by uuid not null references public.profiles(id),
  observations text,
  last_contact_at timestamptz,
  next_action_at timestamptz,
  converted_to_client_at timestamptz,
  lost_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.leads is 'Registros comerciales del CRM. Un lead puede evolucionar a prospecto y luego a cliente dentro del mismo registro.';

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  title text not null,
  description text,
  type task_type not null,
  status task_status not null default 'pending',
  priority priority_level not null default 'medium',
  due_at timestamptz,
  completed_at timestamptz,
  responsible_user_id uuid not null references public.profiles(id),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.tasks is 'Tareas comerciales asociadas a un lead, prospecto o cliente.';

create table if not exists public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  note text not null,
  is_private boolean not null default false,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

comment on table public.lead_notes is 'Notas internas asociadas al lead, prospecto o cliente.';

create table if not exists public.lead_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  event_type text not null,
  description text not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

comment on table public.lead_events is 'Timeline de eventos comerciales: creación, cambio de estado, tarea creada, tarea completada, conversión a cliente, etc.';

create table if not exists public.lead_status_history (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  previous_status lead_status,
  new_status lead_status not null,
  previous_stage lead_stage,
  new_stage lead_stage not null,
  changed_by uuid references public.profiles(id),
  changed_at timestamptz not null default now()
);

comment on table public.lead_status_history is 'Historial de cambios de estado y etapa comercial de cada lead.';

create table if not exists public.whatsapp_reminder_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references public.profiles(id),
  reminder_date date not null,
  message_body text not null,
  status text not null default 'pending',
  provider_message_id text,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.whatsapp_reminder_logs is 'Registro de recordatorios enviados por WhatsApp a los usuarios con sus tareas comerciales del día.';

-- =========================
-- INDEXES
-- =========================

create index if not exists idx_profiles_tenant_id on public.profiles(tenant_id);
create index if not exists idx_leads_tenant_id on public.leads(tenant_id);
create index if not exists idx_leads_created_by on public.leads(created_by);
create index if not exists idx_leads_status on public.leads(status);
create index if not exists idx_leads_stage on public.leads(stage);
create index if not exists idx_tasks_tenant_id on public.tasks(tenant_id);
create index if not exists idx_tasks_responsible_user_id on public.tasks(responsible_user_id);
create index if not exists idx_tasks_due_at on public.tasks(due_at);
create index if not exists idx_tasks_status on public.tasks(status);

-- =========================
-- UPDATED AT TRIGGER
-- =========================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_leads_updated_at on public.leads;
create trigger trg_leads_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

drop trigger if exists trg_tasks_updated_at on public.tasks;
create trigger trg_tasks_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

-- =========================
-- RLS HELPER FUNCTIONS
-- =========================

create or replace function public.current_user_role()
returns app_role
language sql
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid() limit 1;
$$;

create or replace function public.current_tenant_id()
returns uuid
language sql
security definer
set search_path = public
as $$
  select tenant_id from public.profiles where id = auth.uid() limit 1;
$$;

-- =========================
-- ENABLE RLS
-- =========================

alter table public.tenants enable row level security;
alter table public.profiles enable row level security;
alter table public.lead_sources enable row level security;
alter table public.services enable row level security;
alter table public.leads enable row level security;
alter table public.tasks enable row level security;
alter table public.lead_notes enable row level security;
alter table public.lead_events enable row level security;
alter table public.lead_status_history enable row level security;
alter table public.whatsapp_reminder_logs enable row level security;

-- =========================
-- POLICIES
-- =========================

-- TENANTS

drop policy if exists "Users can view own tenant" on public.tenants;
create policy "Users can view own tenant"
on public.tenants for select
to authenticated
using (id = public.current_tenant_id());

-- PROFILES

drop policy if exists "Users can view profiles in tenant" on public.profiles;
create policy "Users can view profiles in tenant"
on public.profiles for select
to authenticated
using (tenant_id = public.current_tenant_id());

drop policy if exists "Admins can manage profiles in tenant" on public.profiles;
create policy "Admins can manage profiles in tenant"
on public.profiles for all
to authenticated
using (tenant_id = public.current_tenant_id() and public.current_user_role() = 'admin')
with check (tenant_id = public.current_tenant_id() and public.current_user_role() = 'admin');

-- CONFIG TABLES

drop policy if exists "Users can view lead sources in tenant" on public.lead_sources;
create policy "Users can view lead sources in tenant"
on public.lead_sources for select
to authenticated
using (tenant_id = public.current_tenant_id());

drop policy if exists "Admins can manage lead sources" on public.lead_sources;
create policy "Admins can manage lead sources"
on public.lead_sources for all
to authenticated
using (tenant_id = public.current_tenant_id() and public.current_user_role() in ('admin', 'commercial_lead'))
with check (tenant_id = public.current_tenant_id() and public.current_user_role() in ('admin', 'commercial_lead'));

drop policy if exists "Users can view services in tenant" on public.services;
create policy "Users can view services in tenant"
on public.services for select
to authenticated
using (tenant_id = public.current_tenant_id());

drop policy if exists "Admins can manage services" on public.services;
create policy "Admins can manage services"
on public.services for all
to authenticated
using (tenant_id = public.current_tenant_id() and public.current_user_role() in ('admin', 'commercial_lead'))
with check (tenant_id = public.current_tenant_id() and public.current_user_role() in ('admin', 'commercial_lead'));

-- LEADS

drop policy if exists "Users can view leads based on role" on public.leads;
create policy "Users can view leads based on role"
on public.leads for select
to authenticated
using (
  tenant_id = public.current_tenant_id()
  and (
    public.current_user_role() in ('admin', 'commercial_lead')
    or created_by = auth.uid()
  )
);

drop policy if exists "Users can create leads in their tenant" on public.leads;
create policy "Users can create leads in their tenant"
on public.leads for insert
to authenticated
with check (
  tenant_id = public.current_tenant_id()
  and created_by = auth.uid()
  and responsible_user_id = auth.uid()
);

drop policy if exists "Users can update allowed leads" on public.leads;
create policy "Users can update allowed leads"
on public.leads for update
to authenticated
using (
  tenant_id = public.current_tenant_id()
  and (
    public.current_user_role() in ('admin', 'commercial_lead')
    or created_by = auth.uid()
  )
)
with check (
  tenant_id = public.current_tenant_id()
  and (
    public.current_user_role() in ('admin', 'commercial_lead')
    or created_by = auth.uid()
  )
);

drop policy if exists "Only admins can delete leads" on public.leads;
create policy "Only admins can delete leads"
on public.leads for delete
to authenticated
using (tenant_id = public.current_tenant_id() and public.current_user_role() = 'admin');

-- TASKS

drop policy if exists "Users can view tasks based on role" on public.tasks;
create policy "Users can view tasks based on role"
on public.tasks for select
to authenticated
using (
  tenant_id = public.current_tenant_id()
  and (
    public.current_user_role() in ('admin', 'commercial_lead')
    or created_by = auth.uid()
    or responsible_user_id = auth.uid()
  )
);

drop policy if exists "Users can create tasks in tenant" on public.tasks;
create policy "Users can create tasks in tenant"
on public.tasks for insert
to authenticated
with check (
  tenant_id = public.current_tenant_id()
  and created_by = auth.uid()
);

drop policy if exists "Users can update allowed tasks" on public.tasks;
create policy "Users can update allowed tasks"
on public.tasks for update
to authenticated
using (
  tenant_id = public.current_tenant_id()
  and (
    public.current_user_role() in ('admin', 'commercial_lead')
    or created_by = auth.uid()
    or responsible_user_id = auth.uid()
  )
)
with check (tenant_id = public.current_tenant_id());

-- NOTES / EVENTS / HISTORY

drop policy if exists "Users can view lead notes" on public.lead_notes;
create policy "Users can view lead notes"
on public.lead_notes for select
to authenticated
using (
  tenant_id = public.current_tenant_id()
  and exists (
    select 1
    from public.leads l
    where l.id = lead_notes.lead_id
      and l.tenant_id = public.current_tenant_id()
      and (public.current_user_role() in ('admin', 'commercial_lead') or l.created_by = auth.uid())
  )
);

drop policy if exists "Users can create lead notes" on public.lead_notes;
create policy "Users can create lead notes"
on public.lead_notes for insert
to authenticated
with check (
  tenant_id = public.current_tenant_id()
  and created_by = auth.uid()
  and exists (
    select 1
    from public.leads l
    where l.id = lead_notes.lead_id
      and l.tenant_id = public.current_tenant_id()
      and (public.current_user_role() in ('admin', 'commercial_lead') or l.created_by = auth.uid())
  )
);

drop policy if exists "Users can view lead events" on public.lead_events;
create policy "Users can view lead events"
on public.lead_events for select
to authenticated
using (
  tenant_id = public.current_tenant_id()
  and exists (
    select 1
    from public.leads l
    where l.id = lead_events.lead_id
      and l.tenant_id = public.current_tenant_id()
      and (public.current_user_role() in ('admin', 'commercial_lead') or l.created_by = auth.uid())
  )
);

drop policy if exists "Users can create lead events" on public.lead_events;
create policy "Users can create lead events"
on public.lead_events for insert
to authenticated
with check (
  tenant_id = public.current_tenant_id()
  and exists (
    select 1
    from public.leads l
    where l.id = lead_events.lead_id
      and l.tenant_id = public.current_tenant_id()
      and (public.current_user_role() in ('admin', 'commercial_lead') or l.created_by = auth.uid())
  )
);

drop policy if exists "Users can view lead status history" on public.lead_status_history;
create policy "Users can view lead status history"
on public.lead_status_history for select
to authenticated
using (
  tenant_id = public.current_tenant_id()
  and exists (
    select 1
    from public.leads l
    where l.id = lead_status_history.lead_id
      and l.tenant_id = public.current_tenant_id()
      and (public.current_user_role() in ('admin', 'commercial_lead') or l.created_by = auth.uid())
  )
);

drop policy if exists "Users can create lead status history" on public.lead_status_history;
create policy "Users can create lead status history"
on public.lead_status_history for insert
to authenticated
with check (
  tenant_id = public.current_tenant_id()
  and exists (
    select 1
    from public.leads l
    where l.id = lead_status_history.lead_id
      and l.tenant_id = public.current_tenant_id()
      and (public.current_user_role() in ('admin', 'commercial_lead') or l.created_by = auth.uid())
  )
);

-- WHATSAPP LOGS

drop policy if exists "Admins can view reminder logs" on public.whatsapp_reminder_logs;
create policy "Admins can view reminder logs"
on public.whatsapp_reminder_logs for select
to authenticated
using (tenant_id = public.current_tenant_id() and public.current_user_role() in ('admin', 'commercial_lead'));
