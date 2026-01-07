-- Create Time Attendance Table
CREATE TABLE IF NOT EXISTS public.time_attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id TEXT NOT NULL,
    vehicle_id TEXT, -- Optional: in case there's vehicle info later similar to your other data
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_time_attendance_employee_id ON public.time_attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_attendance_timestamp ON public.time_attendance(timestamp);

-- Enable RLS (Row Level Security)
ALTER TABLE public.time_attendance ENABLE ROW LEVEL SECURITY;

-- Policy: Employees can view their own attendance
CREATE POLICY "Employees can view own attendance" ON public.time_attendance
    FOR SELECT
    USING (auth.uid() IN (
        SELECT id FROM public.employees WHERE employee_id = time_attendance.employee_id
    ));

-- Policy: Admins/Service Role can manage all
CREATE POLICY "Service role can manage all" ON public.time_attendance
    FOR ALL
    USING (true)
    WITH CHECK (true);
