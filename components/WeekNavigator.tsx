import React from 'react';
import { getWeekDays, isSameDay } from '../utils/dateUtils';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

interface WeekNavigatorProps {
  currentDate: Date;
  onWeekChange: (direction: 'prev' | 'next') => void;
}

export const WeekNavigator: React.FC<WeekNavigatorProps> = ({ currentDate, onWeekChange }) => {
  const weekDays = getWeekDays(currentDate);
  const dayNames = ['월', '화', '수', '목', '금', '토', '일'];
  const today = new Date();

  return (
    <div className="bg-white p-4 rounded-xl shadow-md mt-6">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => onWeekChange('prev')} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
          <ChevronLeftIcon className="h-6 w-6" />
        </button>
        <h3 className="text-lg font-bold text-slate-700">
          {`${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월`}
        </h3>
        <button onClick={() => onWeekChange('next')} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
          <ChevronRightIcon className="h-6 w-6" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, index) => {
          const isToday = isSameDay(day, today);
          const isWeekend = day.getDay() === 6 || day.getDay() === 0;
          
          let dayClass = 'flex flex-col items-center p-2 rounded-lg ';
          if (isToday) {
            dayClass += 'bg-teal-500 text-white shadow';
          } else if (isWeekend) {
            dayClass += 'text-slate-400 bg-slate-50';
          } else {
            dayClass += 'text-slate-700';
          }

          return (
            <div key={day.toISOString()} className={dayClass}>
              <span className="text-sm">{dayNames[index]}</span>
              <span className="text-lg font-bold mt-1">{day.getDate()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};