
export type TabType = 'home' | 'analytics' | 'history' | 'profile';

export interface OTPRequest {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface TimeChangeRequest {
  id: string;
  request_date: string;
  new_start_time: string;
  new_end_time: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface AttendanceRecord {
  id: string;
  date: string;
  day: string;
  checkIn: string;
  checkOut: string | null;
  hours: string;
  status: 'On Time' | 'Late In' | 'Overtime' | 'Absent';
}

export interface LeaveRequest {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  reason: string;
  attachment_url?: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
}

export interface Employee {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  department: string;
  phone_number?: string;
  email?: string;
  role?: "Employee" | "Admin" | "HR";
}

export interface Holiday {
  id: string;
  date: string;
  name: string;
  type: 'Public' | 'Company' | 'Personal';
  month: string;
}

export interface StatsData {
  totalHours: number;
  onTimeRate: number;
  weeklyAttendance: { day: string; hours: number }[];
  leaveBalance: { type: string; count: number; total: number; color: string }[];
}
