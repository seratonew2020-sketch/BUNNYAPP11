import React, { useState } from "react";
import { supabase } from "../services/supabase";

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Append domain if not present to support Employee ID login
    const emailToAuth = email.includes("@") ? email : `${email}@worksync.com`;

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: emailToAuth,
        password,
      });
      if (error) throw error;
      // Session update is handled by onAuthStateChange in App.tsx usually, but we call success to be safe
      onLoginSuccess();
    } catch (err: any) {
      console.error("Supabase Auth Error:", err); // Log the full error for debugging
      let msg = err.message;
      if (msg === "Invalid login credentials")
        msg = "รหัสพนักงานหรือรหัสผ่านไม่ถูกต้อง (Invalid credentials)";
      if (msg.includes("Email not confirmed"))
        msg = "กรุณายืนยันอีเมลของท่านก่อนเข้าสู่ระบบ";
      if (msg.includes("User already registered"))
        msg = "รหัสพนักงานนี้ถูกลงทะเบียนแล้ว";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert(
        "กรุณาระบุรหัสพนักงาน/อีเมล เพื่อรีเซ็ตรหัสผ่าน (Please enter Employee ID/Email)"
      );
      return;
    }
    setLoading(true);

    // Append domain for password reset as well
    const emailToReset = email.includes("@") ? email : `${email}@worksync.com`;

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        emailToReset,
        {
          redirectTo: window.location.origin + "/reset-password",
        }
      );
      if (error) throw error;
      alert("ส่งอีเมลรีเซ็ตรหัสผ่านเรียบร้อยแล้ว (Password reset email sent)");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1d1b32] p-6 text-white relative overflow-hidden font-sans">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[100px] animate-pulse delay-700"></div>

      <div className="z-10 w-full max-w-sm animate-in zoom-in duration-500">
        <div className="mb-8 text-center">
          <div className="size-20 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-[28px] mx-auto flex items-center justify-center shadow-2xl shadow-purple-500/30 mb-6 rotate-3 hover:rotate-6 transition-transform duration-500">
            <span className="material-symbols-outlined text-4xl text-white">
              work_history
            </span>
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/60 mb-2">
            Bunny Time
          </h1>
          <p className="text-slate-400 text-sm">เข้าสู่ระบบด้วยรหัสพนักงาน</p>
        </div>

        <form
          onSubmit={handleAuth}
          className="space-y-4 backdrop-blur-xl bg-white/5 p-8 rounded-[32px] border border-white/10 shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-xs p-3 rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">error</span>
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
              รหัสพนักงาน (Employee ID)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 material-symbols-outlined text-[20px]">
                badge
              </span>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#0f0e1a]/50 border-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-slate-600"
                placeholder="ระบุรหัสพนักงาน (เช่น 20001)"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
              รหัสผ่าน (Password)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 material-symbols-outlined text-[20px]">
                lock
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#0f0e1a]/50 border-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-purple-600/20 active:scale-95 transition-all hover:shadow-purple-600/40 mt-6 relative overflow-hidden"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="size-4 pointer-events-none border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Processing...
              </span>
            ) : (
              "เข้าสู่ระบบ (Sign In)"
            )}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-slate-500 text-xs hover:text-purple-400 transition-colors"
          >
            ลืมรหัสผ่าน? (Forgot Password)
          </button>

          <div className="flex items-center justify-center gap-4 opacity-50">
            <div className="h-1 w-1 rounded-full bg-white/20"></div>
            <p className="text-[10px] text-slate-600">WorkSync Pro v1.0</p>
            <div className="h-1 w-1 rounded-full bg-white/20"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
