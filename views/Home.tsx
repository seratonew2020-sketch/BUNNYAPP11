import React, { useState, useEffect } from "react";
import { getSmartProductivityAdvice } from "../services/geminiService";
import { addToOfflineQueue } from "../services/persistenceService";
import { Holiday } from "../types";
import { supabase } from "../services/supabase";

interface HomeProps {
  userName: string;
}

const Home: React.FC<HomeProps> = ({ userName }) => {
  const [seconds, setSeconds] = useState(19506); // Matches 05:25:06 from screenshot
  const [advice, setAdvice] = useState(
    "คุณ Alex ทำงานมา 5.5 ชั่วโมงแล้ว เก่งมากเลยค่ะ! อย่าลืมพักสายตาหรือลุกขึ้นยืดเส้นยืดสายสักนิด เพื่อเติมพลังให้สมองปลอดโปร่งและพร้อมลุยงานช่วงที่เหลือได้อย่างสดชื่นนะคะ"
  );
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showHolidays, setShowHolidays] = useState(false);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [leaveType, setLeaveType] = useState("Sick Leave");
  const [leaveDate, setLeaveDate] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  // States for Change Work Time
  const [showChangeTimeForm, setShowChangeTimeForm] = useState(false);
  const [showConfirmChangeTime, setShowConfirmChangeTime] = useState(false);
  const [changeTimeDate, setChangeTimeDate] = useState("");
  const [requestStartTime, setRequestStartTime] = useState("09:00");
  const [requestEndTime, setRequestEndTime] = useState("17:00");
  const [requestReason, setRequestReason] = useState("");

  // States for OT Form
  const [showOTForm, setShowOTForm] = useState(false);
  const [showConfirmOT, setShowConfirmOT] = useState(false);
  const [otDate, setOtDate] = useState("");
  const [otStartTime, setOtStartTime] = useState("17:00");
  const [otEndTime, setOtEndTime] = useState("20:00");
  const [otReason, setOtReason] = useState("");
  const [otTab, setOtTab] = useState<"ot" | "holiday">("ot");
  const [holidayDate, setHolidayDate] = useState("");
  const [holidayType, setHolidayType] = useState("Employee Holiday");

  const [holidays, setHolidays] = useState<Holiday[]>([]);

  useEffect(() => {
    const fetchHolidays = async () => {
      const staticHolidays: Holiday[] = [];

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: leaves } = await supabase
            .from("leave_requests")
            .select("*")
            .eq("user_id", user.id)
            .order("start_date", { ascending: true });

          if (leaves) {
            const dbHolidays: Holiday[] = leaves.map((leave) => {
              const startDate = new Date(leave.start_date);
              const day = startDate.getDate();
              const monthNames = [
                "มกราคม",
                "กุมภาพันธ์",
                "มีนาคม",
                "เมษายน",
                "พฤษภาคม",
                "มิถุนายน",
                "กรกฎาคม",
                "สิงหาคม",
                "กันยายน",
                "ตุลาคม",
                "พฤศจิกายน",
                "ธันวาคม",
              ];
              const monthShortNames = [
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

              return {
                id: leave.id,
                date: `${day} ${monthShortNames[startDate.getMonth()]}`,
                month: monthNames[startDate.getMonth()],
                name: `${leave.leave_type} (${
                  leave.status === "Pending"
                    ? "รอการอนุมัติ"
                    : leave.status === "Approved"
                    ? "อนุมัติ"
                    : "ไม่อนุมัติ"
                })`,
                type: leave.status, // Use status as type for styling
              };
            });

            setHolidays([...staticHolidays, ...dbHolidays]);
          } else {
            setHolidays(staticHolidays);
          }
        } else {
          setHolidays(staticHolidays);
        }
      } catch (error) {
        console.error("Error fetching holidays:", error);
        setHolidays(staticHolidays);
      }
    };

    fetchHolidays();
  }, [showHolidays]); // Refresh when modal opens

  const [checkInTime, setCheckInTime] = useState<string>("--:--");

  useEffect(() => {
    const fetchTodayAttendance = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const today = new Date().toISOString().split("T")[0];
          const { data: attendance } = await supabase
            .from("time_attendance")
            .select("check_in")
            .eq("user_id", user.id)
            .eq("date", today)
            .order("check_in", { ascending: true })
            .limit(1)
            .maybeSingle();

          if (attendance && attendance.check_in) {
            const checkInDate = new Date(attendance.check_in);
            const timeString = checkInDate.toLocaleTimeString("th-TH", {
              hour: "2-digit",
              minute: "2-digit",
            });
            setCheckInTime(`${timeString} น.`);

            // Calculate duration in seconds
            const now = new Date();
            const diffMs = now.getTime() - checkInDate.getTime();
            const diffSec = Math.floor(diffMs / 1000);
            setSeconds(diffSec > 0 ? diffSec : 0);
          } else {
            setCheckInTime("--:--");
            setSeconds(0);
          }
        }
      } catch (error) {
        console.error("Error fetching today attendance:", error);
      }
    };

    fetchTodayAttendance();
    const interval = setInterval(fetchTodayAttendance, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);

    if (navigator.onLine) {
      getSmartProductivityAdvice(userName, 5.5).then(setAdvice);
    } else {
      setAdvice("ดูเหมือนคุณจะออฟไลน์อยู่ แต่คุณยังสามารถลงเวลาทำงานได้ปกติ!");
    }

    const handleStatusChange = () => setIsOffline(!navigator.onLine);
    window.addEventListener("online", handleStatusChange);
    window.addEventListener("offline", handleStatusChange);

    return () => {
      clearInterval(timer);
      window.removeEventListener("online", handleStatusChange);
      window.removeEventListener("offline", handleStatusChange);
    };
  }, [userName]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return {
      h: h.toString().padStart(2, "0"),
      m: m.toString().padStart(2, "0"),
      s: s.toString().padStart(2, "0"),
    };
  };

  const { h, m, s } = formatTime(seconds);

  const quickMenuItems = [
    {
      id: "leave",
      label: "ขอลางาน",
      sub: "ส่งคำขอลาหยุด",
      icon: "beach_access",
      color: "orange",
    },

    {
      id: "swap",
      label: "สลับกะงาน",
      sub: "แลกเปลี่ยนวันทำงาน",
      icon: "swap_horiz",
      color: "indigo",
    },
    {
      id: "change_time",
      label: "เปลี่ยนเวลางาน",
      sub: "ปรับปรุงเวลาเข้า-ออก",
      icon: "edit_calendar",
      color: "rose",
    },
    {
      id: "status",
      label: "สถานะการอนุมัติ",
      sub: "ตรวจสอบผลการอนุมัติ",
      icon: "fact_check",
      color: "emerald",
    },
    {
      id: "labelfile",
      label: "ทำงาน",
      sub: "นอกสถานที่",
      icon: "folder",
      color: "blue",
    },
    {
      id: "ot",
      label: "ลง",
      sub: "วันหยุด",
      icon: "alarm_add",
      color: "purple",
    },
    {
      id: "holidays",
      label: "ตารางวันหยุด",
      sub: "วันหยุดบริษัท & นักขัตฤกษ์",
      icon: "event_available",
      color: "pink",
    },
  ];

  const handleFinalSubmitLeave = async () => {
    if (!leaveDate) {
      alert("กรุณาเลือกวันที่ลา");
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("No user found");

      const { error } = await supabase.from("leave_requests").insert({
        user_id: user.id,
        leave_type: leaveType,
        start_date: new Date(leaveDate).toISOString(),
        end_date: new Date(leaveDate).toISOString(),
        status: "Pending",
        reason: "Submitted via App",
      });

      if (error) throw error;

      setShowConfirmSubmit(false);
      setShowLeaveForm(false);
      setAttachedFile(null);
      setLeaveDate(""); // Reset date
      alert("ส่งคำขอลางานเรียบร้อยแล้ว");
    } catch (error: any) {
      console.error("Error submitting leave:", error);
      alert("เกิดข้อผิดพลาด: " + (error.message || "Unknown error"));
    }
  };

  const handleFinalSubmitChangeTime = async () => {
    if (!changeTimeDate) {
      alert("กรุณาเลือกวันที่ต้องการเปลี่ยนเวลา");
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("No user found");

      const { error } = await supabase.from("time_change_requests").insert({
        user_id: user.id,
        request_date: changeTimeDate,
        new_start_time: requestStartTime,
        new_end_time: requestEndTime,
        reason: requestReason,
        status: "Pending",
      });

      if (error) throw error;

      setShowConfirmChangeTime(false);
      setShowChangeTimeForm(false);
      setChangeTimeDate("");
      setRequestReason("");
      alert("ส่งคำขอเปลี่ยนแปลงเวลางานเรียบร้อยแล้ว");
    } catch (error: any) {
      console.error("Error submitting time change:", error);
      alert("เกิดข้อผิดพลาด: " + (error.message || "Unknown error"));
    }
  };

  const handleFinalSubmitOT = async () => {
    if (otTab === "ot") {
      if (!otDate) {
        alert("กรุณาเลือกวันที่ทำ OT");
        return;
      }

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) throw new Error("No user found");

        const { error } = await supabase.from("ot_requests").insert({
          user_id: user.id,
          date: otDate,
          start_time: otStartTime,
          end_time: otEndTime,
          reason: otReason,
          status: "Pending",
        });

        if (error) throw error;

        setShowConfirmOT(false);
        setShowOTForm(false);
        setOtDate("");
        setOtReason("");
        alert("ส่งคำขอ OT เรียบร้อยแล้ว");
      } catch (error: any) {
        console.error("Error submitting OT:", error);
        alert("เกิดข้อผิดพลาด: " + (error.message || "Unknown error"));
      }
    }
  };

  const handleSaveHoliday = async () => {
    if (!holidayDate) {
      alert("กรุณาเลือกวันที่ต้องการหยุด");
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("No user found");

      const { error } = await supabase.from("leave_requests").insert({
        user_id: user.id,
        leave_type: holidayType,
        start_date: new Date(holidayDate).toISOString(),
        end_date: new Date(holidayDate).toISOString(),
        status: "Pending", // Default to Pending effectively requiring admin approval
        reason: "Registered via Holiday Tab",
      });

      if (error) throw error;

      setShowOTForm(false);
      setHolidayDate("");
      alert("ส่งคำขอวันหยุดเรียบร้อยแล้ว (รอการอนุมัติ)");
    } catch (error: any) {
      console.error("Error saving holiday:", error);
      alert("เกิดข้อผิดพลาด: " + (error.message || "Unknown error"));
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          วันจันทร์ที่ 24 ต.ค.
        </p>
        <div className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/10">
          <span className="material-symbols-outlined text-[14px]">
            schedule
          </span>
          <span>กะงาน: 09:00 - 17:00</span>
        </div>
      </div>

      {/* Main Timer Card */}
      <div className="bg-gradient-to-br from-[#6355ff] to-[#7c3aed] rounded-[40px] p-8 shadow-2xl shadow-primary/30 text-white relative overflow-hidden group">
        <div className="absolute -right-12 -top-12 size-40 bg-white/10 rounded-full blur-3xl transition-transform group-hover:scale-150 duration-700"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-10">
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border border-white/10">
              <span className="size-1.5 rounded-full bg-green-400 animate-pulse"></span>
              กำลังทำงาน
            </span>
            <div className="text-right">
              <p className="text-[10px] text-white/60 uppercase font-bold tracking-widest">
                เวลาเข้างาน
              </p>
              <p className="text-lg font-bold">{checkInTime}</p>
            </div>
          </div>

          <div className="text-center mb-8">
            <p className="text-5xl font-bold font-display tracking-tight">
              {h}:{m}
            </p>
            <p className="text-sm text-white/60 mt-2">ชั่วโมงที่ทำงานแล้ว</p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-[11px] font-bold text-white">
              <span>เป้าหมายรายวัน</span>
              <span>5 ชม. 30 น. / 8 ชม.</span>
            </div>
            <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                style={{ width: "68%" }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Advice Section */}
      <div className="bg-[#1d1b32] border border-white/5 p-5 rounded-[24px] flex items-start gap-4">
        <div className="size-10 rounded-full bg-white/5 flex items-center justify-center text-primary shrink-0">
          <span className="material-symbols-outlined text-[24px]">
            {isOffline ? "cloud_off" : "psychology"}
          </span>
        </div>
        <div>
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            {isOffline ? "Offline Mode" : "AI INSIGHTS"}
          </h4>
          <p className="text-sm leading-relaxed text-slate-300 italic">
            "{advice}"
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {quickMenuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === "leave") setShowLeaveForm(true);
              if (item.id === "change_time") setShowChangeTimeForm(true);
              if (item.id === "swap") alert("เข้าสู่หน้าสลับกะงาน");
              if (item.id === "labelfile") alert("แจ้งทำงานนอกสถานที่");
              if (item.id === "ot") setShowOTForm(true);
              if (item.id === "holidays") setShowHolidays(true);
            }}
            className="bg-[#1d1b32] p-4 rounded-2xl border border-white/5 flex flex-col items-start gap-3 shadow-sm hover:border-primary/30 transition-all active:scale-95 text-left group"
          >
            <div
              className={`size-10 flex items-center justify-center rounded-xl bg-${item.color}-500/10 text-${item.color}-400 group-hover:scale-110 transition-transform`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
            </div>
            <div>
              <p className="text-sm font-bold text-white">{item.label}</p>
              <p className="text-[10px] text-slate-500 font-medium">
                {item.sub}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Today Activity */}
      <div className="mt-2">
        <h3 className="text-base font-bold mb-4 flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-primary animate-pulse"></span>
          กิจกรรมวันนี้
        </h3>

        <div className="bg-[#1d1b32] rounded-[24px] border border-white/5 overflow-hidden shadow-xl">
          <div className="flex items-center gap-5 p-5 hover:bg-white/5 transition-colors">
            <div className="size-11 rounded-full bg-[#5444e4]/20 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px] font-bold rotate-180">
                logout
              </span>
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-bold text-white">เข้างาน</p>
              <p className="text-[11px] text-slate-500 font-bold tracking-tight">
                ตรงเวลา
              </p>
            </div>
            <div className="text-right">
              <p className="text-base font-bold tracking-tight text-white">
                09:00 น.
              </p>
            </div>
          </div>

          <div className="mx-6 h-px bg-white/5"></div>

          <div className="flex items-center gap-5 p-5 hover:bg-white/5 transition-colors opacity-80">
            <div className="size-11 rounded-full bg-white/5 text-slate-500 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">
                coffee
              </span>
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-bold text-slate-400">
                เริ่มพักเบรก
              </p>
              <p className="text-[11px] text-slate-500 font-bold tracking-tight">
                พักกลางวัน
              </p>
            </div>
            <div className="text-right">
              <p className="text-base font-bold tracking-tight text-slate-500">
                12:30 น.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Form Modal */}
      {showLeaveForm && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center px-4 pb-20">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowLeaveForm(false)}
          ></div>
          <div className="relative w-full max-w-sm bg-[#1d1b32] rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-full duration-500">
            <div className="bg-orange-500 p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">คำขอลางาน</h3>
                  <p className="text-white/60 text-xs mt-1">
                    ส่งคำขอเพื่อรอการอนุมัติ
                  </p>
                </div>
                <button
                  onClick={() => setShowLeaveForm(false)}
                  className="size-8 rounded-full bg-white/20 flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    close
                  </span>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                  ประเภทการลา
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full mt-1 px-4 py-3 rounded-xl bg-white/5 border-white/10 text-white text-sm font-bold focus:ring-primary"
                >
                  <option value="Sick Leave">ลาป่วย (Sick Leave)</option>
                  <option value="Annual Leave">ลาพักร้อน (Annual Leave)</option>
                  <option value="Personal Leave">ลากิจ (Personal Leave)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                  เลือกวันที่ลา
                </label>
                <input
                  type="date"
                  value={leaveDate}
                  onChange={(e) => setLeaveDate(e.target.value)}
                  className="w-full mt-1 px-4 py-3 rounded-xl bg-white/5 border-white/10 text-white text-sm font-bold focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                  แนบเอกสารใบลา (ถ้ามี)
                </label>
                <div className="mt-1 relative">
                  <input
                    type="file"
                    id="leave-attachment"
                    className="hidden"
                    onChange={(e) =>
                      setAttachedFile(e.target.files ? e.target.files[0] : null)
                    }
                  />
                  <label
                    htmlFor="leave-attachment"
                    className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl p-6 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                  >
                    {attachedFile ? (
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-orange-500/20 text-orange-500 flex items-center justify-center">
                          <span className="material-symbols-outlined">
                            description
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">
                            {attachedFile.name}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {(attachedFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setAttachedFile(null);
                          }}
                          className="size-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/30"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            close
                          </span>
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="size-12 rounded-full bg-white/5 flex items-center justify-center text-slate-400 mb-2 group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-[28px]">
                            upload_file
                          </span>
                        </div>
                        <p className="text-sm font-bold text-slate-300">
                          คลิกเพื่อเลือกไฟล์
                        </p>
                        <p className="text-[10px] text-slate-500">
                          PDF, JPG, PNG (ไม่เกิน 5MB)
                        </p>
                      </>
                    )}
                  </label>
                </div>
              </div>
              <button
                onClick={() => setShowConfirmSubmit(true)}
                className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
              >
                ส่งคำขอลา
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Time Form Modal */}
      {showChangeTimeForm && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center px-4 pb-20">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowChangeTimeForm(false)}
          ></div>
          <div className="relative w-full max-w-sm bg-[#1d1b32] rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-full duration-500">
            <div className="bg-rose-500 p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">ขอเปลี่ยนเวลางาน</h3>
                  <p className="text-white/60 text-xs mt-1">
                    แจ้งความประสงค์ขอปรับเวลา
                  </p>
                </div>
                <button
                  onClick={() => setShowChangeTimeForm(false)}
                  className="size-8 rounded-full bg-white/20 flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    close
                  </span>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                  เลือกวันที่
                </label>
                <input
                  type="date"
                  value={changeTimeDate}
                  onChange={(e) => setChangeTimeDate(e.target.value)}
                  className="w-full mt-1 px-4 py-3 rounded-xl bg-white/5 border-white/10 text-white text-sm font-bold focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                    เวลาเข้างาน
                  </label>
                  <input
                    type="time"
                    value={requestStartTime}
                    onChange={(e) => setRequestStartTime(e.target.value)}
                    className="w-full mt-1 px-4 py-3 rounded-xl bg-white/5 border-white/10 text-white text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                    เวลาออกงาน
                  </label>
                  <input
                    type="time"
                    value={requestEndTime}
                    onChange={(e) => setRequestEndTime(e.target.value)}
                    className="w-full mt-1 px-4 py-3 rounded-xl bg-white/5 border-white/10 text-white text-sm font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                  เหตุผลที่ขอเปลี่ยน
                </label>
                <textarea
                  rows={3}
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  placeholder="ระบุเหตุผลในการขอปรับเวลา..."
                  className="w-full mt-1 px-4 py-3 rounded-xl bg-white/5 border-white/10 text-white text-sm focus:ring-rose-500"
                />
              </div>
              <button
                onClick={() => setShowConfirmChangeTime(true)}
                className="w-full bg-rose-500 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
              >
                ส่งคำขอเปลี่ยนเวลา
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Confirmation Dialog */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center px-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setShowConfirmSubmit(false)}
          ></div>
          <div className="relative w-full max-w-xs bg-[#1d1b32] rounded-[24px] p-6 shadow-2xl animate-in zoom-in duration-300">
            <div className="size-16 mx-auto mb-4 bg-orange-500/20 text-orange-500 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-[32px]">
                warning
              </span>
            </div>
            <h3 className="text-lg font-bold text-center text-white mb-2">
              ยืนยันการส่งคำขอ?
            </h3>
            <p className="text-sm text-slate-400 text-center mb-6">
              คุณกำลังจะส่งคำขอ {leaveType} กรุณาตรวจสอบข้อมูลให้ถูกต้อง
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 py-3 rounded-xl bg-white/5 text-slate-400 font-bold text-xs"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleFinalSubmitLeave}
                className="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-xs"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Time Confirmation Dialog */}
      {showConfirmChangeTime && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center px-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setShowConfirmChangeTime(false)}
          ></div>
          <div className="relative w-full max-w-xs bg-[#1d1b32] rounded-[24px] p-6 shadow-2xl animate-in zoom-in duration-300">
            <div className="size-16 mx-auto mb-4 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-[32px]">
                edit_calendar
              </span>
            </div>
            <h3 className="text-lg font-bold text-center text-white mb-2">
              ยืนยันเปลี่ยนเวลางาน?
            </h3>
            <p className="text-sm text-slate-400 text-center mb-6">
              คุณต้องการปรับเวลาเป็น {requestStartTime} - {requestEndTime}{" "}
              ใช่หรือไม่?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmChangeTime(false)}
                className="flex-1 py-3 rounded-xl bg-white/5 text-slate-400 font-bold text-xs"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleFinalSubmitChangeTime}
                className="flex-1 py-3 rounded-xl bg-rose-500 text-white font-bold text-xs"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OT Form Modal */}
      {showOTForm && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center px-4 pb-20">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowOTForm(false)}
          ></div>
          <div className="relative w-full max-w-sm bg-[#1d1b32] rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-full duration-500">
            <div className="bg-purple-600 p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">แจ้งทำโอที</h3>
                  <p className="text-white/60 text-xs mt-1">
                    ขออนุมัติทำงานล่วงเวลา
                  </p>
                </div>
                <button
                  onClick={() => setShowOTForm(false)}
                  className="size-8 rounded-full bg-white/20 flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    close
                  </span>
                </button>
              </div>
            </div>
            {/* Tab Header */}
            <div className="flex p-1 bg-white/5 rounded-2xl mx-6 translate-y-4 relative z-10">
              <button
                onClick={() => setOtTab("ot")}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  otTab === "ot"
                    ? "bg-purple-500 text-white shadow-lg"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                ขอโอที (OT)
              </button>
              <button
                onClick={() => setOtTab("holiday")}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  otTab === "holiday"
                    ? "bg-purple-500 text-white shadow-lg"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                ลงวันหยุด
              </button>
            </div>

            <div className="p-6 pt-10 space-y-4">
              {otTab === "ot" ? (
                <>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                      วันที่ทำ OT
                    </label>
                    <input
                      type="date"
                      value={otDate}
                      onChange={(e) => setOtDate(e.target.value)}
                      className="w-full mt-1 px-4 py-3 rounded-xl bg-white/5 border-white/10 text-white text-sm font-bold focus:ring-purple-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                        เวลาเริ่ม
                      </label>
                      <input
                        type="time"
                        value={otStartTime}
                        onChange={(e) => setOtStartTime(e.target.value)}
                        className="w-full mt-1 px-4 py-3 rounded-xl bg-white/5 border-white/10 text-white text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                        เวลาสิ้นสุด
                      </label>
                      <input
                        type="time"
                        value={otEndTime}
                        onChange={(e) => setOtEndTime(e.target.value)}
                        className="w-full mt-1 px-4 py-3 rounded-xl bg-white/5 border-white/10 text-white text-sm font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                      รายละเอียดงานที่ทำ
                    </label>
                    <textarea
                      rows={3}
                      value={otReason}
                      onChange={(e) => setOtReason(e.target.value)}
                      placeholder="ระบุงานที่ต้องทำในช่วง OT..."
                      className="w-full mt-1 px-4 py-3 rounded-xl bg-white/5 border-white/10 text-white text-sm focus:ring-purple-500"
                    />
                  </div>
                  <button
                    onClick={() => setShowConfirmOT(true)}
                    className="w-full bg-purple-600 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
                  >
                    ส่งคำขอโอที
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                      เลือกวันที่ต้องการหยุด
                    </label>
                    <input
                      type="date"
                      value={holidayDate}
                      onChange={(e) => setHolidayDate(e.target.value)}
                      className="w-full mt-1 px-4 py-3 rounded-xl bg-white/5 border-white/10 text-white text-sm font-bold focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                      ประเภทวันหยุด
                    </label>
                    <select
                      value={holidayType}
                      onChange={(e) => setHolidayType(e.target.value)}
                      className="w-full mt-1 px-4 py-3 rounded-xl bg-white/5 border-white/10 text-white text-sm font-bold focus:ring-purple-500"
                    >
                      <option value="Employee Holiday">วันหยุดพนักงาน</option>
                      <option value="Special Holiday">วันหยุดพิเศษ</option>
                    </select>
                  </div>
                  <button
                    onClick={handleSaveHoliday}
                    className="w-full bg-purple-600 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-purple-500/20 active:scale-95 transition-all mt-4"
                  >
                    บันทึกวันหยุด
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* OT Confirmation Dialog */}
      {showConfirmOT && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center px-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setShowConfirmOT(false)}
          ></div>
          <div className="relative w-full max-w-xs bg-[#1d1b32] rounded-[24px] p-6 shadow-2xl animate-in zoom-in duration-300">
            <div className="size-16 mx-auto mb-4 bg-purple-500/20 text-purple-500 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-[32px]">
                alarm_add
              </span>
            </div>
            <h3 className="text-lg font-bold text-center text-white mb-2">
              ยืนยันขอทำโอที?
            </h3>
            <p className="text-sm text-slate-400 text-center mb-6">
              เวลา {otStartTime} - {otEndTime} น.
              <br />
              ใช่หรือไม่?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmOT(false)}
                className="flex-1 py-3 rounded-xl bg-white/5 text-slate-400 font-bold text-xs"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleFinalSubmitOT}
                className="flex-1 py-3 rounded-xl bg-purple-600 text-white font-bold text-xs"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}

      {showHolidays && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-20">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowHolidays(false)}
          ></div>
          <div className="relative w-full max-w-sm bg-[#1d1b32] rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-full duration-500">
            <div className="bg-primary p-6 text-white relative">
              <div className="flex justify-between items-center relative z-10">
                <div>
                  <h3 className="text-xl font-bold">รายการวันหยุดของฉัน</h3>
                  <p className="text-white/60 text-xs mt-1">
                    วันหยุดที่บันทึกไว้และวันหยุดบริษัท
                  </p>
                </div>
                <button
                  onClick={() => setShowHolidays(false)}
                  className="size-8 rounded-full bg-white/20 flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    close
                  </span>
                </button>
              </div>
            </div>
            <div className="h-[70vh] overflow-y-auto p-6 space-y-6">
              {holidays.map((h, i) => (
                <div key={h.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`size-3 rounded-full ring-4 ${
                        h.type === "Public" || h.type === "Company"
                          ? "bg-primary ring-primary/10"
                          : h.type === "Approved"
                          ? "bg-emerald-500 ring-emerald-500/10"
                          : h.type === "Rejected"
                          ? "bg-rose-500 ring-rose-500/10"
                          : "bg-amber-500 ring-amber-500/10" // Pending
                      }`}
                    ></div>
                    {i !== holidays.length - 1 && (
                      <div className="w-0.5 h-full bg-white/5 mt-1"></div>
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">
                      {h.month}
                    </p>
                    <p className="text-sm font-bold text-white mt-0.5">
                      {h.name}
                    </p>
                    <span className="text-[11px] font-bold text-primary">
                      {h.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="h-24"></div>
    </div>
  );
};

export default Home;
