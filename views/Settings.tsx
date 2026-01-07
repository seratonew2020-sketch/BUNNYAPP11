import React, { useState, useRef, useEffect } from "react";
import { generateAIAvatar } from "../services/imageService";
import { supabase } from "../services/supabase";

interface SettingsProps {
  profileImage: string;
  userName: string;
  jobTitle: string;
  onImageChange: (newImage: string) => void;
  onProfileUpdate: (name: string, title: string) => void;
}

const Settings: React.FC<SettingsProps> = ({
  profileImage,
  userName,
  jobTitle,
  onImageChange,
  onProfileUpdate,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  // Profile State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editDepartment, setEditDepartment] = useState("");

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [workSchedule, setWorkSchedule] = useState({
    start: "09:00",
    end: "17:00",
  });

  // Notification State
  const [notifyCheckIn, setNotifyCheckIn] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Settings from LocalStorage
  useEffect(() => {
    const savedNotify = localStorage.getItem("work_sync_notify_checkin");
    if (savedNotify !== null) {
      setNotifyCheckIn(JSON.parse(savedNotify));
    }
  }, []);

  // Fetch User Data from Supabase
  useEffect(() => {
    // ... code truncated for brevity, same as existing ...
    const fetchUserData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setEmail(user.email || "");

          const { data: emp, error } = await supabase
            .from("employees")
            .select("*")
            .eq("id", user.id)
            .single();

          if (emp) {
            setFirstName(emp.first_name || "");
            setLastName(emp.last_name || "");
            setEmployeeId(emp.employee_id || "");
            setPhoneNumber(emp.phone_number || "");
            setEditFirstName(emp.first_name || "");
            setEditLastName(emp.last_name || "");
            setEditPhone(emp.phone_number || "");
            setEditDepartment(emp.department || jobTitle);

            if (emp.first_name && emp.last_name) {
              onProfileUpdate(
                `${emp.first_name} ${emp.last_name}`,
                emp.department || jobTitle
              );
            }
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const savedSchedule = localStorage.getItem("work_sync_schedule");
    if (savedSchedule) {
      setWorkSchedule(JSON.parse(savedSchedule));
    }
  }, []);

  const handleToggleNotification = (id: string) => {
    if (id === "notify_checkin") {
      const newValue = !notifyCheckIn;
      setNotifyCheckIn(newValue);
      localStorage.setItem(
        "work_sync_notify_checkin",
        JSON.stringify(newValue)
      );
    }
  };

  const handleCameraUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageChange(reader.result as string);
        setShowOptions(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAIGenerate = async () => {
    setIsGenerating(true);
    setShowOptions(false);
    const generatedImage = await generateAIAvatar(jobTitle);
    if (generatedImage) {
      onImageChange(generatedImage);
    }
    setIsGenerating(false);
  };

  const handleSaveProfile = async () => {
    if (!editFirstName.trim() || !editLastName.trim()) {
      alert("กรุณากรอกชื่อและนามสกุล");
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const updates = {
        id: user.id,
        employee_id:
          employeeId || (user.email ? user.email.split("@")[0] : "unknown"),
        first_name: editFirstName,
        last_name: editLastName,
        phone_number: editPhone,
        department: editDepartment,
        updated_at: new Date(),
      };

      const { error } = await supabase.from("employees").upsert(updates);
      if (error) throw error;

      setFirstName(editFirstName);
      setLastName(editLastName);
      setPhoneNumber(editPhone);

      onProfileUpdate(`${editFirstName} ${editLastName}`, editDepartment);
      alert("บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว");
    } catch (error: any) {
      console.error("Save Profile Error:", error);
      if (error.message && error.message.includes("Could not find the")) {
        alert(
          "แจ้งเตือนระบบ: ฐานข้อมูลยังไม่ได้อัปเดต (Missing Columns). กรุณาแจ้งผู้ดูแลระบบให้รันคำสั่ง SQL Migration"
        );
      } else {
        alert(
          "เกิดข้อผิดพลาดในการบันทึก: " + (error.message || "Unknown error")
        );
      }
    }
  };

  const handleSaveSchedule = () => {
    localStorage.setItem("work_sync_schedule", JSON.stringify(workSchedule));
    setShowScheduleModal(false);
    alert("บันทึกตารางงานใหม่เรียบร้อยแล้ว");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const sections = [
    {
      title: "ทั่วไป",
      items: [
        {
          id: "timezone",
          label: "เขตเวลา",
          value: "GMT +7:00",
          icon: "public",
          color: "bg-primary",
        },
        {
          id: "schedule",
          label: "ตารางงาน",
          value: `${workSchedule.start} - ${workSchedule.end}`,
          icon: "calendar_month",
          color: "bg-indigo-500",
        },
      ],
    },
    {
      title: "การแจ้งเตือน",
      items: [
        {
          id: "notify_checkin",
          label: "เตือนลงเวลา",
          toggle: notifyCheckIn,
          icon: "schedule",
          color: "bg-orange-500",
        },
      ],
    },
  ];

  const hasChanges =
    editFirstName !== firstName ||
    editLastName !== lastName ||
    editPhone !== phoneNumber ||
    editDepartment !== jobTitle;

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <span className="animate-spin material-symbols-outlined text-primary">
          sync
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-6 animate-in fade-in zoom-in duration-500 relative">
      <h2 className="text-center text-primary font-bold text-sm uppercase tracking-widest mb-2">
        ข้อมูลส่วนตัว
      </h2>

      <div className="bg-white dark:bg-surface-dark p-6 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-xl flex flex-col items-center gap-6">
        <div className="relative">
          <div className="size-24 rounded-3xl ring-4 ring-primary/10 overflow-hidden shadow-2xl bg-slate-200 dark:bg-slate-800">
            {isGenerating ? (
              <div className="size-full flex items-center justify-center bg-primary/20 animate-pulse">
                <span className="material-symbols-outlined text-primary animate-spin">
                  auto_awesome
                </span>
              </div>
            ) : (
              <img
                src={profileImage}
                alt="Profile"
                className="size-full object-cover transition-opacity duration-300"
              />
            )}
          </div>
          <button
            onClick={() => setShowOptions(true)}
            className="absolute -bottom-2 -right-2 size-8 bg-primary text-white rounded-full flex items-center justify-center border-4 border-background-light dark:border-background-dark shadow-lg active:scale-90 transition-transform hover:scale-110"
          >
            <span className="material-symbols-outlined text-[16px]">
              add_a_photo
            </span>
          </button>
        </div>

        <div className="w-full space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="relative group">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                ชื่อจริง
              </label>
              <input
                type="text"
                value={editFirstName}
                onChange={(e) => setEditFirstName(e.target.value)}
                className="w-full h-11 px-4 mt-1 rounded-xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm font-bold"
                placeholder="ชื่อ"
              />
            </div>
            <div className="relative group">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                นามสกุล
              </label>
              <input
                type="text"
                value={editLastName}
                onChange={(e) => setEditLastName(e.target.value)}
                className="w-full h-11 px-4 mt-1 rounded-xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm font-bold"
                placeholder="นามสกุล"
              />
            </div>
          </div>

          <div className="relative group">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
              เบอร์โทรศัพท์
            </label>
            <input
              type="tel"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              className="w-full h-11 px-4 mt-1 rounded-xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm font-bold"
              placeholder="081-234-5678"
            />
          </div>

          <div className="relative group opacity-50">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
              รหัสพนักงาน (แก้ไขไม่ได้)
            </label>
            <div className="relative flex items-center mt-1">
              <span className="material-symbols-outlined absolute left-3 text-[18px] text-slate-500">
                badge
              </span>
              <input
                type="text"
                value={employeeId}
                readOnly
                className="w-full h-11 pl-10 pr-4 rounded-xl border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-sm font-bold text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="relative group">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
              ตำแหน่ง / แผนก
            </label>
            <input
              type="text"
              value={editDepartment}
              onChange={(e) => setEditDepartment(e.target.value)}
              className="w-full h-11 px-4 mt-1 rounded-xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm font-bold"
              placeholder="ระบุตำแหน่งงาน"
            />
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={!hasChanges}
            className={`w-full py-3.5 rounded-2xl font-bold text-sm shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
              hasChanges
                ? "bg-primary text-white shadow-primary/20"
                : "bg-slate-100 dark:bg-white/5 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-white/5"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">save</span>
            บันทึกการแก้ไข
          </button>
        </div>
      </div>

      {sections.map((section) => (
        <div key={section.title}>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-3">
            {section.title}
          </h3>
          <div className="bg-white dark:bg-surface-dark rounded-[24px] overflow-hidden shadow-sm border border-slate-100 dark:border-white/5">
            {section.items.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => {
                  if (item.id === "schedule") setShowScheduleModal(true);
                  if (item.toggle !== undefined)
                    handleToggleNotification(item.id);
                }}
                className={`flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer ${
                  idx !== section.items.length - 1
                    ? "border-b border-slate-50 dark:border-white/5"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`size-9 rounded-xl ${item.color} text-white flex items-center justify-center shadow-lg`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {item.icon}
                    </span>
                  </div>
                  <span className="text-sm font-bold">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.value && (
                    <span className="text-xs font-bold text-slate-400">
                      {item.value}
                    </span>
                  )}
                  {item.toggle !== undefined ? (
                    <div
                      className={`w-11 h-6 rounded-full relative transition-colors ${
                        item.toggle
                          ? "bg-primary"
                          : "bg-slate-200 dark:bg-slate-700"
                      }`}
                    >
                      <div
                        className={`absolute top-1 size-4 rounded-full bg-white transition-all shadow-sm ${
                          item.toggle ? "right-1" : "left-1"
                        }`}
                      ></div>
                    </div>
                  ) : (
                    <span className="material-symbols-outlined text-slate-300 dark:text-slate-600">
                      chevron_right
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Work Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-6">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            onClick={() => setShowScheduleModal(false)}
          ></div>
          <div className="relative w-full max-w-xs bg-white dark:bg-surface-dark rounded-[32px] p-8 shadow-2xl animate-in fade-in zoom-in duration-300 border border-white/5">
            <div className="size-16 mx-auto mb-6 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-500 rounded-2xl flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined text-[32px]">
                schedule
              </span>
            </div>
            <h3 className="text-xl font-bold text-center mb-6">
              ตั้งค่าเวลาทำงาน
            </h3>

            <div className="space-y-4 mb-8">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                  เวลาเข้างาน
                </label>
                <input
                  type="time"
                  value={workSchedule.start}
                  onChange={(e) =>
                    setWorkSchedule({ ...workSchedule, start: e.target.value })
                  }
                  className="w-full mt-1 px-4 py-3 rounded-xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                  เวลาออกงาน
                </label>
                <input
                  type="time"
                  value={workSchedule.end}
                  onChange={(e) =>
                    setWorkSchedule({ ...workSchedule, end: e.target.value })
                  }
                  className="w-full mt-1 px-4 py-3 rounded-xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm font-bold"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleSaveSchedule}
                className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-sm shadow-xl shadow-primary/20 active:scale-95 transition-all"
              >
                บันทึกตารางงาน
              </button>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="w-full py-3 rounded-2xl text-slate-400 font-bold text-sm active:scale-95 transition-all"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Options Modal */}
      {showOptions && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-24">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowOptions(false)}
          ></div>
          <div className="relative w-full max-w-sm bg-white dark:bg-surface-dark rounded-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full mx-auto mb-6"></div>
            <h3 className="text-center font-bold mb-6 text-lg">
              เปลี่ยนรูปโปรไฟล์
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-primary/10 transition-colors group border border-slate-100 dark:border-white/5"
              >
                <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">
                    photo_camera
                  </span>
                </div>
                <span className="text-sm font-bold">ใช้กล้อง</span>
              </button>
              <button
                onClick={handleAIGenerate}
                className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-primary/10 transition-colors group border border-slate-100 dark:border-white/5"
              >
                <div className="size-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">
                    auto_awesome
                  </span>
                </div>
                <span className="text-sm font-bold">AI สร้างให้</span>
              </button>
            </div>
            <button
              onClick={() => setShowOptions(false)}
              className="w-full mt-6 py-4 rounded-2xl text-slate-500 font-bold text-sm border border-slate-100 dark:border-white/10"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        capture="user"
        ref={fileInputRef}
        onChange={handleCameraUpload}
        className="hidden"
      />

      <button
        onClick={handleLogout}
        className="w-full bg-rose-500/10 text-rose-500 py-4 rounded-2xl font-bold text-sm shadow-sm hover:bg-rose-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 mb-10 border border-rose-500/20"
      >
        <span className="material-symbols-outlined">logout</span>
        ออกจากระบบ
      </button>

      <div className="h-10"></div>
    </div>
  );
};

export default Settings;
