-- Create Employees Table Migration
-- Check if phone_number exists, if not add it
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'employees' and column_name = 'phone_number') then
    alter table public.employees add column phone_number text;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'employees' and column_name = 'email') then
    alter table public.employees add column email text;
  end if;
end $$;
