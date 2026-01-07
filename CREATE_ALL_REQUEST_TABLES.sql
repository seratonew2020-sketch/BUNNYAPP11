-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TIME ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS public.time_attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    check_in TIMESTAMP WITH TIME ZONE,
    check_out TIMESTAMP WITH TIME ZONE,
    date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'On Time',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.time_attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own attendance" ON public.time_attendance FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own attendance" ON public.time_attendance FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own attendance" ON public.time_attendance FOR UPDATE USING (auth.uid() = user_id);


-- 2. LEAVE REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.leave_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    leave_type TEXT NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    reason TEXT,
    attachment_url TEXT,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT
);
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own leave requests" ON public.leave_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create leave requests" ON public.leave_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own pending requests" ON public.leave_requests FOR UPDATE USING (auth.uid() = user_id AND status = 'Pending');


-- 3. OT REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.ot_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    date DATE NOT NULL,
    start_time TIME WITHOUT TIME ZONE NOT NULL,
    end_time TIME WITHOUT TIME ZONE NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT
);
ALTER TABLE public.ot_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own OT requests" ON public.ot_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create OT requests" ON public.ot_requests FOR INSERT WITH CHECK (auth.uid() = user_id);


-- 4. TIME CHANGE REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.time_change_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    request_date DATE NOT NULL,
    new_start_time TIME WITHOUT TIME ZONE NOT NULL,
    new_end_time TIME WITHOUT TIME ZONE NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT
);
ALTER TABLE public.time_change_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own time change requests" ON public.time_change_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create time change requests" ON public.time_change_requests FOR INSERT WITH CHECK (auth.uid() = user_id);


-- 5. SHIFT SWAP REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.swap_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    target_date DATE NOT NULL,
    swap_with_date DATE, -- Optional: swap with specific date or just generic
    reason TEXT,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT
);
ALTER TABLE public.swap_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own swap requests" ON public.swap_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create swap requests" ON public.swap_requests FOR INSERT WITH CHECK (auth.uid() = user_id);


-- 6. OUTSIDE WORK REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.outside_work_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    date DATE NOT NULL,
    location TEXT NOT NULL,
    start_time TIME WITHOUT TIME ZONE,
    end_time TIME WITHOUT TIME ZONE,
    reason TEXT,
    attachment_url TEXT,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT
);
ALTER TABLE public.outside_work_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own outside work requests" ON public.outside_work_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create outside work requests" ON public.outside_work_requests FOR INSERT WITH CHECK (auth.uid() = user_id);


-- Ensure employees table has role column
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'Employee';

-- Grand Permissions
GRANT ALL ON public.time_attendance TO authenticated;
GRANT ALL ON public.leave_requests TO authenticated;
GRANT ALL ON public.ot_requests TO authenticated;
GRANT ALL ON public.time_change_requests TO authenticated;
GRANT ALL ON public.swap_requests TO authenticated;
GRANT ALL ON public.outside_work_requests TO authenticated;
