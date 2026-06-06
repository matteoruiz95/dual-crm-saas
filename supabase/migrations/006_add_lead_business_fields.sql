-- =====================================================
-- ADD BUSINESS FIELDS TO LEADS
-- Campos adicionales para enriquecer la creación del lead
-- =====================================================

alter table public.leads
add column if not exists country text;

alter table public.leads
add column if not exists state_region text;

alter table public.leads
add column if not exists city text;

alter table public.leads
add column if not exists industry text;

alter table public.leads
add column if not exists website_url text;

alter table public.leads
add column if not exists instagram_url text;

alter table public.leads
add column if not exists owner_name text;

alter table public.leads
add column if not exists probable_pain text;

alter table public.leads
add column if not exists initial_service text;

alter table public.leads
add column if not exists lead_temperature text default 'warm';

comment on column public.leads.country is 'País donde se encuentra el lead o empresa.';
comment on column public.leads.state_region is 'Estado, departamento o región del lead.';
comment on column public.leads.city is 'Ciudad del lead o empresa.';
comment on column public.leads.industry is 'Industria o sector económico de la empresa.';
comment on column public.leads.website_url is 'Sitio web de la empresa o lead.';
comment on column public.leads.instagram_url is 'Perfil de Instagram del lead o empresa.';
comment on column public.leads.owner_name is 'Dueño, representante o contacto principal de la empresa.';
comment on column public.leads.probable_pain is 'Dolor probable o necesidad identificada.';
comment on column public.leads.initial_service is 'Servicio inicial recomendado o de interés.';
comment on column public.leads.lead_temperature is 'Temperatura comercial del lead: hot, warm, cold.';