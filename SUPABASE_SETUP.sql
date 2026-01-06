-- Create Employees Table (ตารางพนักงาน)
create table public.employees (
  id uuid references auth.users not null primary key, -- Linked to Supabase Auth User ID
  employee_id text not null unique, -- Employee ID (รหัสพนักงาน)
  first_name text,
  last_name text,
  department text,
  is_first_login boolean default true, -- For password change requirement
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.employees enable row level security;

-- Policies
create policy "Employees can view their own profile" on public.employees
  for select using (auth.uid() = id);

create policy "Employees can update their own profile" on public.employees
  for update using (auth.uid() = id);

-- Create Login History Table (ประวัติการเข้าสู่ระบบ)
create table public.login_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  login_at timestamptz default now(),
  ip_address text,
  user_agent text
);

-- Enable RLS
alter table public.login_history enable row level security;

create policy "Users can view their own login history" on public.login_history
  for select using (auth.uid() = user_id);

create policy "Service role can insert login history" on public.login_history
  for insert with check (true);

-- Trigger to handle new user creation automatically (Optional, if creating via Auth API directly)
-- This function mimics what our script will do, ensuring data consistency if users are created elsewhere
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.employees (id, employee_id)
  values (new.id, split_part(new.email, '@', 1)); -- Assumptions: email is ID@worksync.com
  return new;
end;
$$ language plpgsql security definer;

-- trigger (commented out as we are doing manual seeding, but good for future)
-- create trigger on_auth_user_created
--   after insert on auth.users
--   for each row execute procedure public.handle_new_user();
