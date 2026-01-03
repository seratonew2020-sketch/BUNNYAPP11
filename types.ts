
export type TabType = 'home' | 'analytics' | 'history' | 'profile';

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
  type: string;
  startDate: string;
  endDate: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  duration: number;
}

export interface Holiday {
  id: string;
  date: string;
  name: string;
  type: 'Public' | 'Company';
  month: string;
}

export interface StatsData {
  totalHours: number;
  onTimeRate: number;
  weeklyAttendance: { day: string; hours: number }[];
  leaveBalance: { type: string; count: number; total: number; color: string }[];
}
