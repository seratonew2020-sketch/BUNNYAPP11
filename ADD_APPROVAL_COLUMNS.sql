-- Add columns to track approval status
ALTER TABLE public.leave_requests
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Create a policy to allow Admins (or HR) to update these columns
-- For now, we might rely on the 'update' policy.
-- Assuming we need a way to distinguish admins.
-- For this simple version, we might allow all authenticated users to 'update' (which is risky)
-- OR strictly relying on a specific 'role' column in employees table if it exists.
-- Checking employees table again...
-- distinct role is not in the employees schema I saw earlier.
-- I will add a 'role' column to employees as well to support admin checks.

ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'Employee' CHECK (role IN ('Employee', 'Admin', 'HR'));

-- Update Policies for Approval
-- Allow Admins to update any leave request
CREATE POLICY "Admins can update leave requests" ON public.leave_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.employees
      WHERE employees.id = auth.uid()
      AND employees.role IN ('Admin', 'HR')
    )
  );

-- Allow Admins to view all leave requests (to approve them)
CREATE POLICY "Admins can view all leave requests" ON public.leave_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.employees
      WHERE employees.id = auth.uid()
      AND employees.role IN ('Admin', 'HR')
    )
  );
