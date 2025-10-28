
import React from 'react';
import { Booking, HolidaySchedule, Masseuse, User } from '../types';
import { TIME_SLOTS_DETAILS } from '../constants';
import { formatToISODate, isPastTime, getStartOfWeek, getEndOfWeek, parseISODate } from '../utils/dateUtils';

interface WeekTimeTableProps {
  scheduleDays: Date[];
  masseuses: Masseuse[];
  bookings: Booking[];
  holidays: HolidaySchedule;
  currentUser: User;
  onBookSlot: (masseuseId: string, date: Date, time: string) => void;
}

export const WeekTimeTable: React.FC<WeekTimeTableProps> = ({ scheduleDays, masseuses, bookings, currentUser, holidays, onBookSlot }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md mt-6 overflow-x-auto">
      <table className="w-full border-collapse text-center min-w-[1200px]">
        <thead>
          <tr className="bg-slate-100">
            <th className="p-3 font-semibold text-slate-600 border border-slate-200 sticky left-0 bg-slate-100 z-20 w-[100px]">날짜</th>
            <th className="p-3 font-semibold text-slate-600 border border-slate-200 sticky left-[100px] bg-slate-100 z-20 w-[100px]">담당자</th>
            {TIME_SLOTS_DETAILS.map(slot => (
              <th key={slot.time} className="p-2 font-semibold text-slate-600 border border-slate-200 text-sm">
                <span className="font-bold">{slot.session}</span>
                <br />
                <span className="font-normal text-xs">{slot.display.replace('-', '- ')}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {scheduleDays.map((day, dayIndex) => (
            <React.Fragment key={day.toISOString()}>
              {masseuses.map((masseuse, masseuseIndex) => (
                <tr 
                  key={masseuse.id} 
                  className={`even:bg-slate-50/50 ${masseuseIndex === 0 && dayIndex > 0 ? 'border-t-4 border-slate-300' : ''}`}
                >
                  {masseuseIndex === 0 && (
                    <td rowSpan={masseuses.length} className="p-2 border border-slate-200 font-semibold text-slate-700 sticky left-0 bg-white z-10 w-[100px]">
                      {day.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}
                      <br/>
                      ({day.toLocaleDateString('ko-KR', { weekday: 'short' })})
                    </td>
                  )}
                  <td className="p-2 border border-slate-200 font-semibold text-slate-700 sticky left-[100px] bg-white z-10 w-[100px]">{masseuse.name}</td>
                  {TIME_SLOTS_DETAILS.map(({ time }) => {
                    const isoDate = formatToISODate(day);
                    const holidayType = holidays[masseuse.id]?.[isoDate];
                    let isHoliday = false;

                    if (holidayType === 'full') {
                      isHoliday = true;
                    } else if (holidayType === 'am') {
                      const slotHour = parseInt(time.split(':')[0], 10);
                      if (slotHour < 13) isHoliday = true;
                    } else if (holidayType === 'pm') {
                      const slotHour = parseInt(time.split(':')[0], 10);
                      if (slotHour >= 13) isHoliday = true;
                    }

                    const booking = bookings.find(b => b.masseuseId === masseuse.id && b.date === isoDate && b.time === time);
                    const isPast = isPastTime(day, time);
                    
                    const cellClass = "p-0 border border-slate-200 h-14";
                    let content;

                    if (isHoliday) {
                      content = <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-500 text-sm font-medium">휴무</div>;
                    } else if (booking) {
                      const colorClass = booking.userId === currentUser.id ? 'bg-teal-500' : 'bg-gray-300';
                      const name = booking.userId === currentUser.id ? currentUser.name : '예약완료';
                      content = <div className={`w-full h-full ${colorClass} text-white flex items-center justify-center font-bold text-sm`}>{name}</div>;
                    } else if (isPast) {
                      content = <div className="w-full h-full bg-slate-50"></div>;
                    } else {
                      let isButtonDisabled = false;

                      if (bookings.some(b => b.userId === currentUser.id && b.date === isoDate)) {
                        isButtonDisabled = true;
                      }
                      
                      if (!isButtonDisabled) {
                        const bookingWeekStart = getStartOfWeek(day);
                        const bookingWeekEnd = getEndOfWeek(day);
                        const bookingsInSameWeek = bookings.filter(b => {
                            if (b.userId !== currentUser.id) return false;
                            const bookingDate = parseISODate(b.date);
                            return bookingDate >= bookingWeekStart && bookingDate <= bookingWeekEnd;
                        });

                        if (bookingsInSameWeek.length >= 2) {
                            isButtonDisabled = true;
                        } else if (bookingsInSameWeek.some(b => b.masseuseId === masseuse.id)) {
                            isButtonDisabled = true;
                        }
                      }

                      content = (
                        <button
                          onClick={() => onBookSlot(masseuse.id, day, time)}
                          className="w-full h-full text-teal-600 hover:bg-teal-100 transition-colors text-sm font-semibold disabled:bg-slate-100 disabled:cursor-not-allowed"
                          aria-label={`${masseuse.name} ${time} 예약`}
                          disabled={isButtonDisabled}
                        >
                          {isButtonDisabled ? '' : '예약'}
                        </button>
                      );
                    }
                    
                    return <td key={`${isoDate}-${time}-${masseuse.id}`} className={cellClass}>{content}</td>;
                  })}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};
