
import React, { useState, useMemo } from 'react';
import { AttendanceRecord } from '../types';

const History: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Mock data with standardized dates
  const initialRecords: (AttendanceRecord & { isoDate: string })[] = [
    { id: '1', date: '24 Oct', isoDate: '2024-10-24', day: 'Monday', checkIn: '09:00 AM', checkOut: '05:30 PM', hours: '8h 30m', status: 'On Time' },
    { id: '2', date: '23 Oct', isoDate: '2024-10-23', day: 'Sunday', checkIn: '09:45 AM', checkOut: '06:45 PM', hours: '9h 00m', status: 'Late In' },
    { id: '3', date: '22 Oct', isoDate: '2024-10-22', day: 'Saturday', checkIn: '10:00 AM', checkOut: '04:00 PM', hours: '6h 00m', status: 'Overtime' },
    { id: '4', date: '21 Oct', isoDate: '2024-10-21', day: 'Friday', checkIn: '-', checkOut: '-', hours: '0h 00m', status: 'Absent' },
    { id: '5', date: '20 Oct', isoDate: '2024-10-20', day: 'Thursday', checkIn: '08:55 AM', checkOut: '05:00 PM', hours: '8h 05m', status: 'On Time' },
    { id: '6', date: '19 Oct', isoDate: '2024-10-19', day: 'Wednesday', checkIn: '09:10 AM', checkOut: '06:00 PM', hours: '8h 50m', status: 'Late In' },
  ];

  const filteredRecords = useMemo(() => {
    return initialRecords.filter(record => {
      const matchesSearch = record.date.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           record.day.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilters.length === 0 || statusFilters.includes(record.status);
      const matchesStartDate = !startDate || record.isoDate >= startDate;
      const matchesEndDate = !endDate || record.isoDate <= endDate;
      
      return matchesSearch && matchesStatus && matchesStartDate && matchesEndDate;
    });
  }, [searchTerm, statusFilters, startDate, endDate]);

  const toggleStatusFilter = (status: string) => {
    setStatusFilters(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status) 
        : [...prev, status]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Time': return 'text-emerald-500 bg-emerald-500/10 ring-emerald-500/20';
      case 'Late In': return 'text-amber-500 bg-amber-500/10 ring-amber-500/20';
      case 'Overtime': return 'text-indigo-500 bg-indigo-500/10 ring-indigo-500/20';
      case 'Absent': return 'text-rose-500 bg-rose-500/10 ring-rose-500/20';
      default: return 'text-slate-500 bg-slate-500/10 ring-slate-500/20';
    }
  };

  const statuses = ['On Time', 'Late In', 'Absent', 'Overtime'];

  return (
    <div className="flex flex-col p-6 animate-in fade-in slide-in-from-left-4 duration-500">
      {/* Overview Card */}
      <div className="bg-[#1d1b32] p-6 rounded-[32px] shadow-2xl border border-white/5 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 size-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-2xl bg-primary/20 text-primary flex items-center justify-center border border-primary/20">
              <span className="material-symbols-outlined text-[32px]">history</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">ชั่วโมงทำงานรวม</p>
              <h2 className="text-3xl font-bold text-white">38.5 <span className="text-sm font-medium text-slate-400">ชั่วโมง</span></h2>
            </div>
          </div>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all font-bold text-sm ${
              showFilters 
              ? 'bg-primary text-white shadow-xl shadow-primary/30 ring-2 ring-primary/20' 
              : 'bg-white/5 text-slate-300 border border-white/5'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">tune</span>
            ตัวกรอง
            {(statusFilters.length > 0 || startDate || endDate) && (
              <span className="size-2 bg-rose-500 rounded-full animate-pulse"></span>
            )}
          </button>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="mt-8 pt-8 border-t border-white/5 space-y-6 animate-in slide-in-from-top-4 duration-500 ease-out">
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">เลือกสถานะที่ต้องการแสดง</p>
                {statusFilters.length > 0 && (
                  <button 
                    onClick={() => setStatusFilters([])}
                    className="text-[10px] font-bold text-primary hover:underline"
                  >
                    ล้างทั้งหมด
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {statuses.map(status => (
                  <button 
                    key={status}
                    onClick={() => toggleStatusFilter(status)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                      statusFilters.includes(status) 
                      ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                      : 'bg-white/5 border-white/5 text-slate-500'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">ช่วงวันที่เริ่มต้น</p>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">calendar_today</span>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/5 text-xs font-bold text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">ช่วงวันที่สิ้นสุด</p>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">event</span>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/5 text-xs font-bold text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => { setStatusFilters([]); setStartDate(''); setEndDate(''); setSearchTerm(''); }}
                className="flex-1 py-3 text-xs font-bold text-slate-400 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/5"
              >
                ล้างตัวกรองทั้งหมด
              </button>
              <button 
                onClick={() => setShowFilters(false)}
                className="flex-1 py-3 text-xs font-bold text-white bg-primary rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
              >
                ใช้ตัวกรอง
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Search Input */}
      <div className="relative mb-6 group">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">search</span>
        <input 
          type="text" 
          placeholder="ค้นหาตามวันที่หรือวัน..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-14 pl-12 pr-4 rounded-2xl bg-[#1d1b32] border border-white/5 shadow-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm font-medium text-white transition-all placeholder:text-slate-600"
        />
      </div>

      {/* History Table Container */}
      <div className="bg-[#1d1b32] rounded-[32px] border border-white/5 overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-white/5">
              <tr>
                <th className="px-6 py-5">ข้อมูลวันที่</th>
                <th className="px-6 py-5">เวลาเข้า - ออก</th>
                <th className="px-6 py-5">ชั่วโมงรวม</th>
                <th className="px-6 py-5 text-right">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRecords.length > 0 ? filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-5">
                    <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{record.date}</p>
                    <p className="text-[10px] font-bold text-slate-500">{record.day}</p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[14px] text-slate-600">login</span>
                      <p className="text-[11px] font-bold text-slate-300">{record.checkIn}</p>
                      <span className="text-slate-700 mx-1">—</span>
                      <p className="text-[11px] font-bold text-slate-300">{record.checkOut}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg inline-block">{record.hours}</p>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-600">
                      <div className="size-20 rounded-full bg-white/5 flex items-center justify-center">
                        <span className="material-symbols-outlined text-5xl">search_off</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-base font-bold text-slate-400">ไม่พบประวัติการเข้างาน</p>
                        <p className="text-xs font-medium">ลองเปลี่ยนเงื่อนไขการค้นหาหรือตัวกรองดูนะ</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="h-28"></div>
    </div>
  );
};

export default History;
