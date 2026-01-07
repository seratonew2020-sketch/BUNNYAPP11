-- 1. อัปเดตตาราง employees (Update employees table)
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS phone_number text;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS email text;

-- 2. สร้างตาราง time_attendance (Create time_attendance table)
CREATE TABLE IF NOT EXISTS public.time_attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id TEXT NOT NULL,
    vehicle_id TEXT,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. สร้าง Indexes เพื่อความรวดเร็ว (Create Indexes)
CREATE INDEX IF NOT EXISTS idx_time_attendance_employee_id ON public.time_attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_attendance_timestamp ON public.time_attendance(timestamp);

-- 4. ตั้งค่าความปลอดภัย RLS (Enable Security)
ALTER TABLE public.time_attendance ENABLE ROW LEVEL SECURITY;

-- Policy: พนักงานดูข้อมูลของตัวเองได้
DROP POLICY IF EXISTS "Employees can view own attendance" ON public.time_attendance;
CREATE POLICY "Employees can view own attendance" ON public.time_attendance
    FOR SELECT
    USING (auth.uid() IN (
        SELECT id FROM public.employees WHERE employee_id = time_attendance.employee_id
    ));

-- Policy: Admin/Service Role จัดการได้ทั้งหมด
DROP POLICY IF EXISTS "Service role can manage all" ON public.time_attendance;
CREATE POLICY "Service role can manage all" ON public.time_attendance
    FOR ALL
    USING (true)
    WITH CHECK (true);
