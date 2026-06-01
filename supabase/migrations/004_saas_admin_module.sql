-- =====================================================
-- SAAS ADMIN MODULE
-- Empresas, usuarios y permisos para platform_admin
-- =====================================================

-- Campos extra del perfil
alter table public.profiles
add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.profiles
add column if not exists updated_at timestamptz default now();


-- Función para que cada usuario actualice su propio perfil
create or replace function public.update_my_profile(
  p_full_name text,
  p_phone text,
  p_metadata jsonb
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles;
begin
  update public.profiles
  set
    full_name = p_full_name,
    phone = nullif(p_phone, ''),
    metadata = coalesce(p_metadata, '{}'::jsonb),
    updated_at = now()
  where id = auth.uid()
  returning * into v_profile;

  if v_profile.id is null then
    raise exception 'profile_not_found';
  end if;

  return v_profile;
end;
$$;

grant execute on function public.update_my_profile(text, text, jsonb) to authenticated;


-- Convertir a Mateo en administrador global del SaaS
update public.profiles
set role = 'platform_admin'
where lower(email) = lower('m.ruiz@dualdev.co');


-- =====================================================
-- RLS ACTUALIZADO PARA INCLUIR platform_admin
-- =====================================================

-- PROFILES
drop policy if exists "Admins can manage profiles in tenant" on public.profiles;

create policy "Admins can manage profiles in tenant"
on public.profiles
for all
using (
  tenant_id = public.current_tenant_id()
  and public.current_user_role() in ('platform_admin', 'admin')
)
with check (
  tenant_id = public.current_tenant_id()
  and public.current_user_role() in ('platform_admin', 'admin')
);


-- LEAD SOURCES
drop policy if exists "Admins can manage lead sources" on public.lead_sources;

create policy "Admins can manage lead sources"
on public.lead_sources
for all
using (
  tenant_id = public.current_tenant_id()
  and public.current_user_role() in ('platform_admin', 'admin', 'commercial_lead')
)
with check (
  tenant_id = public.current_tenant_id()
  and public.current_user_role() in ('platform_admin', 'admin', 'commercial_lead')
);


-- SERVICES
drop policy if exists "Admins can manage services" on public.services;

create policy "Admins can manage services"
on public.services
for all
using (
  tenant_id = public.current_tenant_id()
  and public.current_user_role() in ('platform_admin', 'admin', 'commercial_lead')
)
with check (
  tenant_id = public.current_tenant_id()
  and public.current_user_role() in ('platform_admin', 'admin', 'commercial_lead')
);


-- LEADS
drop policy if exists "Users can view leads based on role" on public.leads;

create policy "Users can view leads based on role"
on public.leads
for select
using (
  tenant_id = public.current_tenant_id()
  and (
    public.current_user_role() in ('platform_admin', 'admin', 'commercial_lead')
    or created_by = auth.uid()
  )
);


drop policy if exists "Users can update allowed leads" on public.leads;

create policy "Users can update allowed leads"
on public.leads
for update
using (
  tenant_id = public.current_tenant_id()
  and (
    public.current_user_role() in ('platform_admin', 'admin', 'commercial_lead')
    or created_by = auth.uid()
  )
)
with check (
  tenant_id = public.current_tenant_id()
  and (
    public.current_user_role() in ('platform_admin', 'admin', 'commercial_lead')
    or created_by = auth.uid()
  )
);


drop policy if exists "Only admins can delete leads" on public.leads;

create policy "Only admins can delete leads"
on public.leads
for delete
using (
  tenant_id = public.current_tenant_id()
  and public.current_user_role() in ('platform_admin', 'admin')
);


-- TASKS
drop policy if exists "Users can view tasks based on role" on public.tasks;

create policy "Users can view tasks based on role"
on public.tasks
for select
using (
  tenant_id = public.current_tenant_id()
  and (
    public.current_user_role() in ('platform_admin', 'admin', 'commercial_lead')
    or responsible_user_id = auth.uid()
    or created_by = auth.uid()
  )
);


drop policy if exists "Users can update allowed tasks" on public.tasks;

create policy "Users can update allowed tasks"
on public.tasks
for update
using (
  tenant_id = public.current_tenant_id()
  and (
    public.current_user_role() in ('platform_admin', 'admin', 'commercial_lead')
    or responsible_user_id = auth.uid()
    or created_by = auth.uid()
  )
)
with check (
  tenant_id = public.current_tenant_id()
  and (
    public.current_user_role() in ('platform_admin', 'admin', 'commercial_lead')
    or responsible_user_id = auth.uid()
    or created_by = auth.uid()
  )
);


-- LEAD NOTES
drop policy if exists "Users can view lead notes" on public.lead_notes;

create policy "Users can view lead notes"
on public.lead_notes
for select
using (
  exists (
    select 1
    from public.leads l
    where l.id = lead_notes.lead_id
      and l.tenant_id = public.current_tenant_id()
      and (
        public.current_user_role() in ('platform_admin', 'admin', 'commercial_lead')
        or l.created_by = auth.uid()
      )
  )
);


drop policy if exists "Users can create lead notes" on public.lead_notes;

create policy "Users can create lead notes"
on public.lead_notes
for insert
with check (
  tenant_id = public.current_tenant_id()
  and created_by = auth.uid()
  and exists (
    select 1
    from public.leads l
    where l.id = lead_notes.lead_id
      and l.tenant_id = public.current_tenant_id()
      and (
        public.current_user_role() in ('platform_admin', 'admin', 'commercial_lead')
        or l.created_by = auth.uid()
      )
  )
);


-- LEAD EVENTS
drop policy if exists "Users can view lead events" on public.lead_events;

create policy "Users can view lead events"
on public.lead_events
for select
using (
  exists (
    select 1
    from public.leads l
    where l.id = lead_events.lead_id
      and l.tenant_id = public.current_tenant_id()
      and (
        public.current_user_role() in ('platform_admin', 'admin', 'commercial_lead')
        or l.created_by = auth.uid()
      )
  )
);


drop policy if exists "Users can create lead events" on public.lead_events;

create policy "Users can create lead events"
on public.lead_events
for insert
with check (
  tenant_id = public.current_tenant_id()
  and exists (
    select 1
    from public.leads l
    where l.id = lead_events.lead_id
      and l.tenant_id = public.current_tenant_id()
      and (
        public.current_user_role() in ('platform_admin', 'admin', 'commercial_lead')
        or l.created_by = auth.uid()
      )
  )
);


-- LEAD STATUS HISTORY
drop policy if exists "Users can view lead status history" on public.lead_status_history;

create policy "Users can view lead status history"
on public.lead_status_history
for select
using (
  exists (
    select 1
    from public.leads l
    where l.id = lead_status_history.lead_id
      and l.tenant_id = public.current_tenant_id()
      and (
        public.current_user_role() in ('platform_admin', 'admin', 'commercial_lead')
        or l.created_by = auth.uid()
      )
  )
);


drop policy if exists "Users can create lead status history" on public.lead_status_history;

create policy "Users can create lead status history"
on public.lead_status_history
for insert
with check (
  tenant_id = public.current_tenant_id()
  and exists (
    select 1
    from public.leads l
    where l.id = lead_status_history.lead_id
      and l.tenant_id = public.current_tenant_id()
      and (
        public.current_user_role() in ('platform_admin', 'admin', 'commercial_lead')
        or l.created_by = auth.uid()
      )
  )
);


-- WHATSAPP REMINDER LOGS
drop policy if exists "Admins can view reminder logs" on public.whatsapp_reminder_logs;

create policy "Admins can view reminder logs"
on public.whatsapp_reminder_logs
for select
using (
  tenant_id = public.current_tenant_id()
  and public.current_user_role() in ('platform_admin', 'admin', 'commercial_lead')
);