import axios from 'axios';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or Anon Key is missing in environment variables.");
}

// Create an Axios instance for Supabase REST API
const api = axios.create({
  baseURL: `${supabaseUrl}/rest/v1`,
  headers: {
    'apikey': supabaseAnonKey,
    'Content-Type': 'application/json',
  },
});

export const fetchAttendanceLogs = async (accessToken: string) => {
  const response = await api.get('/time_attendance', {
    headers: {
      Authorization: `Bearer ${accessToken}`, // Pass User JWT for RLS
    },
    params: {
      select: '*',
      order: 'date.desc',
    },
  });
  return response.data;
};

export const fetchEmployees = async (accessToken: string) => {
  const response = await api.get('/employees', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    params: {
        select: 'id,employee_id,first_name,last_name'
    }
  });
  return response.data;
};
