
import React from 'react';
import { Booking, Masseuse, User } from '../types';
import { getStartOfWeek, getEndOfWeek } from '../utils/dateUtils';
import { XIcon } from './icons';

interface BookingSummaryProps {
  bookings: Booking[];
  currentUser: User;
  masseuses: Masseuse[];
  onCancelBooking: (bookingId: string) => void;
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({ bookings, currentUser, masseuses, onCancelBooking }) => {
  const now = new Date();
  const startOfWeek = getStartOfWeek(now);
  const endOfWeek = getEndOfWeek(now);

  const userBookingsThisWeek = bookings.filter(b => {
    const bookingDate = new Date(b.date);
    return b.userId === currentUser.id && bookingDate >= startOfWeek && bookingDate <= endOfWeek;
  });

  const getMasseuseName = (id: string) => {
    return masseuses.find(m => m.id === id)?.name || 'Unknown';
  };
  
  const bookingsRemaining = 2 - userBookingsThisWeek.length;

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <h3 className="text-xl font-bold mb-2 text-slate-700">{currentUser.name}님의 예약 현황</h3>
      <p className="text-slate-500 mb-4">
        이번 주 예약 가능 횟수: <span className="font-bold text-teal-600">{bookingsRemaining}</span> / 2
      </p>
      {userBookingsThisWeek.length > 0 ? (
        <ul className="space-y-3">
          {userBookingsThisWeek.map(booking => (
            <li key={booking.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
              <div>
                <p className="font-semibold">{getMasseuseName(booking.masseuseId)}</p>
                <p className="text-sm text-slate-600">
                  {new Date(booking.date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} - {booking.time}
                </p>
              </div>
              <button 
                onClick={() => onCancelBooking(booking.id)}
                className="p-1.5 rounded-full text-red-500 hover:bg-red-100 transition-colors"
                aria-label="Cancel booking"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-slate-400 py-4">이번 주 예약이 없습니다.</p>
      )}
    </div>
  );
};
