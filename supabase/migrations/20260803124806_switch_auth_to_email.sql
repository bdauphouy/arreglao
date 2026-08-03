-- Auth pivoted from phone+OTP to email+OTP (SMS providers restricted the target
-- market's country for trial verification; email needs no third-party provider setup).
alter table public.profiles drop column phone;
alter table public.profiles add column email text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;
