
import { AttendanceRecord } from '../types';

const STORAGE_KEYS = {
  ATTENDANCE: 'work_sync_attendance_history',
  PROFILE_IMAGE: 'work_sync_profile_img',
  OFFLINE_QUEUE: 'work_sync_offline_queue'
};

export interface OfflineAction {
  id: string;
  type: 'CHECK_IN' | 'CHECK_OUT' | 'UPDATE_PROFILE';
  payload: any;
  timestamp: number;
}

export const getLocalAttendance = (): AttendanceRecord[] => {
  const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
  return data ? JSON.parse(data) : [
    { id: '1', date: '24 Oct', day: 'Monday', checkIn: '09:00 AM', checkOut: '05:30 PM', hours: '8h 30m', status: 'On Time' },
    { id: '2', date: '23 Oct', day: 'Sunday', checkIn: '09:45 AM', checkOut: '06:45 PM', hours: '9h 00m', status: 'Late In' },
  ];
};

export const saveLocalAttendance = (records: AttendanceRecord[]) => {
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
};

export const addToOfflineQueue = (action: Omit<OfflineAction, 'id' | 'timestamp'>) => {
  const queue: OfflineAction[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE) || '[]');
  const newAction: OfflineAction = {
    ...action,
    id: crypto.randomUUID(),
    timestamp: Date.now()
  };
  queue.push(newAction);
  localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
  return newAction;
};

export const getOfflineQueue = (): OfflineAction[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE) || '[]');
};

export const clearOfflineQueue = () => {
  localStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
};
