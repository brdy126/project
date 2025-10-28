
import React, { useState } from 'react';
import { Masseuse, HolidaySchedule } from '../types';
import { WeekNavigator } from '../components/WeekNavigator';
import { getWorkWeekDays, formatToISODate, isPastTime } from '../utils/dateUtils';
import { PUBLIC_HOLIDAYS } from '../constants';

interface AdminViewProps {
  masseuses: Masseuse[];
  holidays: HolidaySchedule;
  onCycleHoliday: (masseuseId: string, date: Date) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ masseuses, holidays, onCycleHoliday }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAdminId, setSelectedAdminId] = useState(masseuses[0].id);
  
  const workWeekDays = getWorkWeekDays(currentDate);
  const dayNames = ['월', '화', '수', '목', '금'];
  const adminHolidays = holidays[selectedAdminId] || {};

  const handleWeekChange = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + (direction === 'prev' ? -7 : 7));
      return newDate;
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white p-4 rounded-xl shadow-md">
        <h2 className="text-xl font-bold mb-4 text-slate-700">관리자 설정</h2>
        <label htmlFor="admin-select" className="block text-sm font-medium text-slate-600 mb-2">
          관리할 마사지사 선택:
        </label>
        <select
          id="admin-select"
          value={selectedAdminId}
          onChange={(e) => setSelectedAdminId(e.target.value)}
          className="w-full p-2 border border-slate-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
        >
          {masseuses.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>
      <WeekNavigator currentDate={currentDate} onWeekChange={handleWeekChange} />
      <div className="bg-white p-4 rounded-xl shadow-md">
        <h3 className="text-lg font-bold mb-4 text-slate-700">휴일 설정</h3>
        <p className="text-sm text-slate-500 mb-4">날짜를 클릭하여 근무, 종일 휴무, 오전/오후 반차 순으로 상태를 변경하세요.</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {workWeekDays.map((day, index) => {
            const isoDate = formatToISODate(day);
            const holidayType = adminHolidays[isoDate];
            const isPast = isPastTime(day, '23:59');
            const isPublicHoliday = PUBLIC_HOLIDAYS.includes(isoDate);

            let statusText: string;
            let buttonClass = 'flex flex-col items-center p-3 rounded-lg transition-colors border-2 ';
            
            if (isPublicHoliday) {
                statusText = '공휴일';
                buttonClass += 'bg-gray-200 text-gray-500 cursor-not-allowed border-gray-300';
            } else if (isPast) {
              buttonClass += 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200';
              statusText = holidayType ? '휴일' : '지나감';
            } else {
                switch (holidayType) {
                    case 'full': statusText = '종일 휴무'; buttonClass += 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200'; break;
                    case 'am': statusText = '오전 반차'; buttonClass += 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200'; break;
                    case 'pm': statusText = '오후 반차'; buttonClass += 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200'; break;
                    default: statusText = '근무'; buttonClass += 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100';
                }
            }

            return (
              <button key={isoDate} disabled={isPast || isPublicHoliday} onClick={() => onCycleHoliday(selectedAdminId, day)} className={buttonClass}>
                <span className="font-semibold">{dayNames[index]}</span>
                <span className="text-lg mt-1">{day.getDate()}</span>
                <span className="text-xs mt-2 font-bold">{statusText}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
