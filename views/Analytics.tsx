
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { analyzeWeeklyTrends } from '../services/geminiService';

const Analytics: React.FC = () => {
  const [trendInsight, setTrendInsight] = useState("กำลังวิเคราะห์แนวโน้มของคุณ...");
  
  const weeklyData = [
    { day: 'จ.', hours: 8.5 },
    { day: 'อ.', hours: 4.5 },
    { day: 'พ.', hours: 7.5 },
    { day: 'พฤ.', hours: 6.0 },
    { day: 'ศ.', hours: 8.0 },
  ];

  const trendData = [
    { name: 'สัปดาห์ 1', late: 10 },
    { name: 'สัปดาห์ 2', late: 20 },
    { name: 'สัปดาห์ 3', late: 12 },
    { name: 'สัปดาห์ 4', late: 15 },
  ];

  useEffect(() => {
    analyzeWeeklyTrends("Working avg 7h/day, late 2 times").then(setTrendInsight);
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button className="h-9 px-5 rounded-full bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 shrink-0">เดือนนี้</button>
        <button className="h-9 px-5 rounded-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 text-sm font-medium shrink-0">เดือนก่อน</button>
        <button className="h-9 px-5 rounded-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 text-sm font-medium shrink-0">ปีนี้</button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-surface-dark p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5">
          <div className="flex justify-between items-start mb-4">
            <div className="size-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <span className="material-symbols-outlined">schedule</span>
            </div>
            <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> 2.5%
            </span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">ชม. ทำงานรวม</p>
          <p className="text-2xl font-bold mt-1">160 ชม.</p>
        </div>
        <div className="bg-white dark:bg-surface-dark p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5">
          <div className="flex justify-between items-start mb-4">
            <div className="size-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <span className="material-symbols-outlined">timer</span>
            </div>
            <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> 0.8%
            </span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">ตรงเวลา</p>
          <p className="text-2xl font-bold mt-1">95%</p>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="text-base font-bold">การเข้างานรายสัปดาห์</h3>
            <p className="text-xs text-slate-400 font-medium">เป้าหมาย vs จริง</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold">42 ชม.</p>
            <p className="text-[10px] font-bold text-green-500">+5% จากสัปดาห์ก่อน</p>
          </div>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8', fontWeight: 600}} dy={10} />
              <Tooltip 
                cursor={{fill: 'transparent'}}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="hours" radius={[8, 8, 8, 8]} barSize={36}>
                {weeklyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#5444e4' : '#818cf8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-base font-bold">แนวโน้มการมาสาย</h3>
            <p className="text-xs text-slate-400 font-medium">เฉลี่ยล่าช้า 15 นาที</p>
          </div>
          <button className="text-slate-400"><span className="material-symbols-outlined">more_horiz</span></button>
        </div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorLate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5444e4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#5444e4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="late" stroke="#5444e4" strokeWidth={3} fillOpacity={1} fill="url(#colorLate)" />
              <Tooltip />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 p-3 bg-slate-50 dark:bg-white/5 rounded-xl text-xs text-slate-600 dark:text-slate-400 italic">
          AI Insight: "{trendInsight}"
        </div>
      </div>

      <div className="h-20"></div>
    </div>
  );
};

export default Analytics;
