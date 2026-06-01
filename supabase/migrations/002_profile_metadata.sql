alter table public.profiles
add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.profiles
add column if not exists updated_at timestamptz default now();

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