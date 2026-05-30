-- =====================================================
-- Seed inicial para Dual Developments
-- Reemplaza REPLACE_WITH_AUTH_USER_ID por el UUID real del usuario creado en Supabase Auth.
-- =====================================================

with inserted_tenant as (
  insert into public.tenants (name, legal_name, country, city, email)
  values ('Dual Developments', 'Dual Developments SAS', 'Colombia', 'Medellín', 'contacto@dualdevelopments.com')
  returning id
), inserted_profile as (
  insert into public.profiles (id, tenant_id, full_name, email, phone, role)
  select
    'REPLACE_WITH_AUTH_USER_ID'::uuid,
    id,
    'Mateo Ruiz',
    'mateo@dualdevelopments.com',
    null,
    'admin'
  from inserted_tenant
  returning tenant_id
)
insert into public.lead_sources (tenant_id, name)
select inserted_profile.tenant_id, sources.source_name
from inserted_profile
cross join (
  values
    ('LinkedIn'),
    ('Instagram'),
    ('WhatsApp'),
    ('Referido'),
    ('Página web'),
    ('Evento'),
    ('Cliente actual'),
    ('Llamada en frío')
) as sources(source_name);

with admin_profile as (
  select tenant_id
  from public.profiles
  where id = 'REPLACE_WITH_AUTH_USER_ID'::uuid
)
insert into public.services (tenant_id, name, description)
select admin_profile.tenant_id, services.service_name, services.service_description
from admin_profile
cross join (
  values
    ('Power Apps', 'Aplicaciones empresariales low-code.'),
    ('Power BI', 'Dashboards, modelos semánticos y analítica.'),
    ('Inteligencia Artificial', 'Automatización y asistentes con IA.'),
    ('Automatización', 'Flujos, integraciones y eficiencia operativa.'),
    ('Desarrollo Web', 'Aplicaciones web modernas.'),
    ('CRM', 'Soluciones comerciales y seguimiento de clientes.'),
    ('Microsoft 365', 'Productividad, seguridad y colaboración.'),
    ('Desarrollo a medida', 'Soluciones personalizadas de software.')
) as services(service_name, service_description);
