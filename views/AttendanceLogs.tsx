import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../services/supabase";

interface AttendanceLog {
  id: string;
  employee_id: string; // From time_attendance.employee_id
  user_id: string; // From time_attendance.user_id
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
  employee_name: string;
  employee_code: string;
}

const AttendanceLogs: React.FC = () => {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // 1. Fetch all attendance records
      const { data: attendanceData, error: attendanceError } = await supabase
        .from("time_attendance")
        .select("*")
        .order("date", { ascending: false });

      if (attendanceError) throw attendanceError;

      // 2. Fetch all employees
      const { data: employeeData, error: employeeError } = await supabase
        .from("employees")
        .select("id, employee_id, first_name, last_name");

      if (employeeError) throw employeeError;

      // Map employees for quick lookup
      const employeeMap = new Map();
      if (employeeData) {
        employeeData.forEach((emp) => {
          // Key by Supabase User ID (id) AND/OR Table employee_id if needed.
          // The time_attendance table uses 'user_id' (UUID) and 'employee_id' (text).
          // We'll prioritize joining by user_id if available, or employee_id.
          employeeMap.set(emp.id, `${emp.first_name} ${emp.last_name}`);
          employeeMap.set(
            emp.employee_id,
            `${emp.first_name} ${emp.last_name}`,
          );
        });
      }

      // 3. Merge data
      if (attendanceData) {
        const mergedLogs: AttendanceLog[] = attendanceData.map(
          (record: any) => {
            // Attempt to find name by user_id first, then employee_id
            let name = "Unknown";
            if (record.user_id && employeeMap.has(record.user_id)) {
              name = employeeMap.get(record.user_id);
            } else if (
              record.employee_id &&
              employeeMap.has(record.employee_id)
            ) {
              name = employeeMap.get(record.employee_id);
            }

            const checkInObj = record.check_in
              ? new Date(record.check_in)
              : null;
            const checkOutObj = record.check_out
              ? new Date(record.check_out)
              : null;

            return {
              id: record.id,
              employee_id: record.employee_id || "-",
              user_id: record.user_id,
              date: record.date,
              check_in: checkInObj
                ? checkInObj.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "-",
              check_out: checkOutObj
                ? checkOutObj.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "-",
              status: record.status,
              employee_name: name,
              employee_code: record.employee_id || "-", // Display ID
            };
          },
        );
        setLogs(mergedLogs);
      }
    } catch (error) {
      console.error("Error fetching attendance logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.employee_code.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStartDate = !startDate || log.date >= startDate;
      const matchesEndDate = !endDate || log.date <= endDate;

      return matchesSearch && matchesStartDate && matchesEndDate;
    });
  }, [logs, searchTerm, startDate, endDate]);

  // Format Date to Thai (Helper)
  const formatThaiDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const months = [
      "ม.ค.",
      "ก.พ.",
      "มี.ค.",
      "เม.ย.",
      "พ.ค.",
      "มิ.ย.",
      "ก.ค.",
      "ส.ค.",
      "ก.ย.",
      "ต.ค.",
      "พ.ย.",
      "ธ.ค.",
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear() + 543}`;
  };

  return (
    <div className="flex flex-col p-6 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="material-symbols-outlined text-3xl text-primary">
            table_view
          </span>
          บันทึกเวลาเข้า-ออกงาน
        </h1>
        <button
          onClick={fetchLogs}
          className="size-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-slate-400 hover:text-white"
        >
          <span
            className={`material-symbols-outlined ${loading ? "animate-spin" : ""}`}
          >
            refresh
          </span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[#1d1b32] p-4 rounded-2xl border border-white/5 mb-6 shadow-xl space-y-4">
        {/* Search */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="ค้นหาชื่อ หรือ รหัสพนักงาน..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 pl-11 pr-4 rounded-xl bg-white/5 border border-white/5 text-sm font-medium text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-600"
          />
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">
              ตั้งแต่วันที่
            </p>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/5 text-xs text-white focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">
              ถึงวันที่
            </p>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/5 text-xs text-white focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1d1b32] rounded-[24px] border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-white/5">
              <tr>
                <th className="px-4 py-4">พนักงาน</th>
                <th className="px-4 py-4">วันที่</th>
                <th className="px-4 py-4 text-center">เวลา</th>
                <th className="px-4 py-4 text-right">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-10 text-center text-slate-500"
                  >
                    <div className="flex justify-center items-center gap-2">
                      <span className="size-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></span>
                      กำลังโหลดข้อมูล...
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm font-bold text-white">
                          {log.employee_name}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono tracking-wider">
                          {log.employee_code}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-xs font-medium text-slate-300">
                        {formatThaiDate(log.date)}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="inline-flex items-center gap-2 bg-white/5 rounded-lg px-2 py-1">
                        <span className="text-[10px] font-bold text-emerald-400">
                          {log.check_in}
                        </span>
                        <span className="text-slate-600 text-[10px]">-</span>
                        <span className="text-[10px] font-bold text-amber-400">
                          {log.check_out}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${
                          log.status === "On Time"
                            ? "text-emerald-500 bg-emerald-500/10 ring-emerald-500/20"
                            : log.status === "Late In"
                              ? "text-amber-500 bg-amber-500/10 ring-amber-500/20"
                              : log.status === "Absent"
                                ? "text-rose-500 bg-rose-500/10 ring-rose-500/20"
                                : "text-slate-500 bg-slate-500/10 ring-slate-500/20"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-10 text-center text-slate-500 text-xs"
                  >
                    ไม่พบข้อมูล
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="h-24"></div>
    </div>
  );
};

export default AttendanceLogs;
