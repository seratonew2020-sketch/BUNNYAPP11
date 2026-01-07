-- Fix RLS Policies for Employees Table
-- Run this in Supabase SQL Editor to fix the "new row violates row-level security policy" error.

-- 1. Reset Policies (to prevent 'policy already exists' errors)
DROP POLICY IF EXISTS "Employees can view their own profile" ON public.employees;
DROP POLICY IF EXISTS "Employees can update their own profile" ON public.employees;
DROP POLICY IF EXISTS "Employees can insert their own profile" ON public.employees;

-- 2. Verify RLS is authorized
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- 3. Create Allow Policies
-- Allow Read
CREATE POLICY "Employees can view their own profile" ON public.employees
  FOR SELECT USING (auth.uid() = id);

-- Allow Update
CREATE POLICY "Employees can update their own profile" ON public.employees
  FOR UPDATE USING (auth.uid() = id);

-- Allow Insert (This is the critical missing one!)
CREATE POLICY "Employees can insert their own profile" ON public.employees
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. Grant access to authenticated users
GRANT ALL ON public.employees TO authenticated;
