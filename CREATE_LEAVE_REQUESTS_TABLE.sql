-- Create Leave Requests Table
CREATE TABLE IF NOT EXISTS public.leave_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL, -- Link to Auth User
    leave_type TEXT NOT NULL, -- Sick Leave, Annual Leave, etc.
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE, -- Can be same as start_date for 1 day
    reason TEXT,
    attachment_url TEXT, -- Path to file in Storage
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_leave_requests_user_id ON public.leave_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON public.leave_requests(status);

-- Enable RLS
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Users can view their own requests
CREATE POLICY "Users can view their own leave requests" ON public.leave_requests
    FOR SELECT
    USING (auth.uid() = user_id);

-- 2. Users can create requests
CREATE POLICY "Users can create leave requests" ON public.leave_requests
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 3. Service Role / Admins can manage all (Optional specifics can be added later)
CREATE POLICY "Service role can manage all leave requests" ON public.leave_requests
    FOR ALL
    USING (true)
    WITH CHECK (true);
