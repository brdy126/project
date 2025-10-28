import React from 'react';
import { Booking } from '../types';
import { TIME_SLOTS } from '../constants';
import { formatToISODate, isPastTime } from '../utils/dateUtils';

interface WeekTimeTableProps {
  workWeekDays: Date[];
  masseuseId: string;
  bookings: Booking[];
  holidays: Record<string, string[]>;
  onBookSlot: (date: Date, time: string) => void;
}

export const WeekTimeTable: React.FC<WeekTimeTableProps> = ({ workWeekDays, masseuseId, bookings, holidays, onBookSlot }) => {
  const masseuseHolidays = holidays[masseuseId] || [];
  const dayNames = ['월', '화', '수', '목', '금'];
  
  return (
    <div className="bg-white p-4 rounded-xl shadow-md mt-6 overflow-x-auto">
      <h3 className="text-xl font-bold mb-4 text-slate-700">
        주간 예약 가능 시간
      </h3>
      <div className="grid grid-cols-6 gap-2 min-w-[700px]">
        {/* Header: Time slot labels */}
        <div className="font-bold text-center py-2 sticky left-0 bg-white">시간</div>
        {workWeekDays.map((day, index) => (
          <div key={day.toISOString()} className="font-bold text-center py-2">
            <p>{dayNames[index]}</p>
            <p className="text-sm font-normal text-slate-500">{day.getDate()}</p>
          </div>
        ))}
        
        {/* Time slots rows */}
        {TIME_SLOTS.map(time => (
          <React.Fragment key={time}>
            <div className="font-semibold text-center py-3 sticky left-0 bg-white">{time}</div>
            {workWeekDays.map(day => {
              const isoDate = formatToISODate(day);
              const isHoliday = masseuseHolidays.includes(isoDate);
              const isBooked = bookings.some(b => b.masseuseId === masseuseId && b.date === isoDate && b.time === time);
              const isPast = isPastTime(day, time);
              const isDisabled = isHoliday || isBooked || isPast;

              let buttonClass = 'p-3 rounded-lg font-semibold transition-transform transform focus:outline-none focus:ring-2 focus:ring-offset-2 w-full text-sm ';
              let buttonText = time;

              if (isHoliday) {
                buttonClass += 'bg-red-100 text-red-400 cursor-not-allowed';
                buttonText = '휴일';
              } else if (isBooked) {
                buttonClass += 'bg-slate-200 text-slate-400 cursor-not-allowed';
                buttonText = '예약완료';
              } else if (isPast) {
                buttonClass += 'bg-slate-100 text-slate-400 cursor-not-allowed';
              } else {
                buttonClass += 'bg-teal-100 text-teal-800 hover:bg-teal-200 hover:scale-105 active:scale-100 focus:ring-teal-500';
              }

              return (
                <div key={`${isoDate}-${time}`} className="flex items-center justify-center">
                  <button
                    disabled={isDisabled}
                    onClick={() => onBookSlot(day, time)}
                    className={buttonClass}
                  >
                    {buttonText}
                  </button>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};