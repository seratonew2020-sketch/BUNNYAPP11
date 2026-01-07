-- Add the 'role' column to the employees table if it doesn't exist
-- This is required for the application to function correctly.

ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'Employee';

-- Optional: Add a comment
COMMENT ON COLUMN public.employees.role IS 'User role: Employee, Admin, or HR';
