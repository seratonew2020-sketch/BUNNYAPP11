-- Add Insert Policy for Employees
CREATE POLICY "Employees can insert their own profile" ON public.employees
  FOR INSERT WITH CHECK (auth.uid() = id);
