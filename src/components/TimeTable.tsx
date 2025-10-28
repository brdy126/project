
import React, { useMemo } from 'react';
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

const TimeSlotCell: React.FC<{
  status: 'booked_by_user' | 'booked_by_other' | 'holiday' | 'past' | 'available' | 'unavailable_rule';
  booking?: Booking;
  onBook: () => void;
}> = ({ status, booking, onBook }) => {
  const cellClass = "p-0 border border-slate-200 h-14";

  switch (status) {
    case 'holiday':
      return <td className={cellClass}><div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-500 text-sm font-medium">휴무</div></td>;
    case 'booked_by_user':
      return <td className={cellClass}><div className="w-full h-full bg-teal-500 text-white flex items-center justify-center font-bold text-sm">{booking?.userName}</div></td>;
    case 'booked_by_other':
        return <td className={cellClass}><div className="w-full h-full bg-gray-300 text-white flex items-center justify-center font-bold text-sm">{booking?.userName}</div></td>;
    case 'past':
      return <td className={cellClass}><div className="w-full h-full bg-slate-50"></div></td>;
    case 'unavailable_rule':
      return <td className={cellClass}><div className="w-full h-full bg-slate-100 opacity-70"></div></td>;
    case 'available':
      return (
        <td className={cellClass}>
          <button onClick={onBook} className="w-full h-full text-teal-600 hover:bg-teal-100 transition-colors text-sm font-semibold">
            예약
          </button>
        </td>
      );
    default:
      return <td className={cellClass}></td>;
  }
};

export const WeekTimeTable: React.FC<WeekTimeTableProps> = ({ scheduleDays, masseuses, bookings, currentUser, holidays, onBookSlot }) => {
  const bookingsByWeek = useMemo(() => {
    const map = new Map<string, Booking[]>();
    bookings.forEach(b => {
      const weekStart = getStartOfWeek(parseISODate(b.date)).toISOString();
      if (!map.has(weekStart)) map.set(weekStart, []);
      map.get(weekStart)?.push(b);
    });
    return map;
  }, [bookings]);

  const getSlotStatus = (day: Date, time: string, masseuse: Masseuse): { status: 'booked_by_user' | 'booked_by_other' | 'holiday' | 'past' | 'available' | 'unavailable_rule'; booking?: Booking; } => {
    const isoDate = formatToISODate(day);
    const holidayType = holidays[masseuse.id]?.[isoDate];

    if (holidayType) {
      const slotHour = parseInt(time.split(':')[0], 10);
      if (holidayType === 'full' || (holidayType === 'am' && slotHour < 13) || (holidayType === 'pm' && slotHour >= 13)) {
        return { status: 'holiday' };
      }
    }

    const booking = bookings.find(b => b.masseuseId === masseuse.id && b.date === isoDate && b.time === time);
    if (booking) {
      return { status: booking.userId === currentUser.id ? 'booked_by_user' : 'booked_by_other', booking };
    }

    if (isPastTime(day, time)) {
      return { status: 'past' };
    }

    // Check booking rules
    const userBookingsOnDay = bookings.some(b => b.userId === currentUser.id && b.date === isoDate);
    if (userBookingsOnDay) return { status: 'unavailable_rule' };

    const weekStart = getStartOfWeek(day).toISOString();
    const userBookingsInWeek = (bookingsByWeek.get(weekStart) || []).filter(b => b.userId === currentUser.id);

    if (userBookingsInWeek.length >= 2 || userBookingsInWeek.some(b => b.masseuseId === masseuse.id)) {
      return { status: 'unavailable_rule' };
    }

    return { status: 'available' };
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-md mt-6 overflow-x-auto">
      <table className="w-full border-collapse text-center min-w-[1200px]">
        <thead>
          <tr className="bg-slate-100">
            <th className="p-3 font-semibold text-slate-600 border border-slate-200 sticky left-0 bg-slate-100 z-20 w-[100px]">날짜</th>
            <th className="p-3 font-semibold text-slate-600 border border-slate-200 sticky left-[100px] bg-slate-100 z-20 w-[100px]">담당자</th>
            {TIME_SLOTS_DETAILS.map(slot => (
              <th key={slot.time} className="p-2 font-semibold text-slate-600 border border-slate-200 text-sm">
                <span className="font-bold">{slot.session}</span><br /><span className="font-normal text-xs">{slot.display.replace('-', '- ')}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {scheduleDays.map((day, dayIndex) => (
            <React.Fragment key={day.toISOString()}>
              {masseuses.map((masseuse, masseuseIndex) => (
                <tr key={masseuse.id} className={`even:bg-slate-50/50 ${masseuseIndex === 0 && dayIndex > 0 ? 'border-t-4 border-slate-300' : ''}`}>
                  {masseuseIndex === 0 && (
                    <td rowSpan={masseuses.length} className="p-2 border border-slate-200 font-semibold text-slate-700 sticky left-0 bg-white z-10 w-[100px]">
                      {day.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}<br/>({day.toLocaleDateString('ko-KR', { weekday: 'short' })})
                    </td>
                  )}
                  <td className="p-2 border border-slate-200 font-semibold text-slate-700 sticky left-[100px] bg-white z-10 w-[100px]">{masseuse.name}</td>
                  {TIME_SLOTS_DETAILS.map(({ time }) => {
                    const { status, booking } = getSlotStatus(day, time, masseuse);
                    return (
                      <TimeSlotCell
                        key={`${time}-${masseuse.id}`}
                        status={status}
                        booking={booking}
                        onBook={() => onBookSlot(masseuse.id, day, time)}
                      />
                    );
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
