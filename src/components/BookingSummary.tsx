
import React, { useState, useRef, useEffect } from 'react';
import { Booking, Masseuse, User, CancelledBookingNotification } from '../types';
import { getStartOfWeek, getEndOfWeek, parseISODate } from '../utils/dateUtils';
import { XIcon, MoveIcon } from './icons';

interface BookingSummaryProps {
  bookings: Booking[];
  currentUser: User;
  masseuses: Masseuse[];
  onCancelBooking: (bookingId: string) => void;
  cancelledNotifications: CancelledBookingNotification[];
  onDismissNotification: (bookingId: string) => void;
}

const BookingList: React.FC<{
    title: string;
    bookings: Booking[];
    remaining: number;
    onCancel: (id: string) => void;
    getMasseuseName: (id: string) => string;
}> = ({ title, bookings, remaining, onCancel, getMasseuseName }) => (
    <div>
        <h4 className="font-bold text-slate-600 mb-2">{title}</h4>
        <p className="text-slate-500 mb-3 text-sm">
            예약 가능 횟수: <span className="font-bold text-teal-600">{remaining < 0 ? 0 : remaining}</span> / 2
        </p>
        {bookings.length > 0 ? (
            <ul className="space-y-3">
                {bookings.map(booking => (
                    <li key={booking.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                        <div>
                            <p className="font-semibold">{getMasseuseName(booking.masseuseId)}</p>
                            <p className="text-sm text-slate-600">
                                {parseISODate(booking.date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })} - {booking.time}
                            </p>
                        </div>
                        <button
                            onClick={() => onCancel(booking.id)}
                            className="p-1.5 rounded-full text-red-500 hover:bg-red-100 transition-colors"
                            aria-label="Cancel booking"
                        >
                            <XIcon className="h-5 w-5" />
                        </button>
                    </li>
                ))}
            </ul>
        ) : (
            <p className="text-center text-slate-400 py-3 text-sm">해당 주에 예약이 없습니다.</p>
        )}
    </div>
);

export const BookingSummary: React.FC<BookingSummaryProps> = ({ bookings, currentUser, masseuses, onCancelBooking, cancelledNotifications, onDismissNotification }) => {
  const now = new Date();
  const startOfWeek = getStartOfWeek(now);
  const endOfWeek = getEndOfWeek(now);

  const nextWeekDate = new Date();
  nextWeekDate.setDate(now.getDate() + 7);
  const startOfNextWeek = getStartOfWeek(nextWeekDate);
  const endOfNextWeek = getEndOfWeek(nextWeekDate);

  const dragRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const offsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const componentWidth = 360; // w-[350px]
    const initialX = window.innerWidth - componentWidth - 32;
    const initialY = 160;
    setPosition({ x: initialX > 0 ? initialX : 32, y: initialY });
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragRef.current) {
      setIsDragging(true);
      const rect = dragRef.current.getBoundingClientRect();
      offsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({ x: e.clientX - offsetRef.current.x, y: e.clientY - offsetRef.current.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const userBookings = bookings.filter(b => b.userId === currentUser.id);
  const userBookingsThisWeek = userBookings.filter(b => {
    const bookingDate = parseISODate(b.date);
    return bookingDate >= startOfWeek && bookingDate <= endOfWeek;
  });
  const userBookingsNextWeek = userBookings.filter(b => {
    const bookingDate = parseISODate(b.date);
    return bookingDate >= startOfNextWeek && bookingDate <= endOfNextWeek;
  });

  const getMasseuseName = (id: string) => masseuses.find(m => m.id === id)?.name || 'Unknown';

  return (
    <div 
      ref={dragRef}
      className="fixed bg-white p-4 rounded-xl shadow-xl w-[350px] z-30 border"
      style={{ top: `${position.y}px`, left: `${position.x}px` }}
    >
      <div 
        className="flex items-center justify-between mb-3 pb-3 border-b border-slate-200 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
      >
        <h3 className="text-xl font-bold text-slate-700">{currentUser.name}님의 예약 현황</h3>
        <MoveIcon className="w-5 h-5 text-slate-400" />
      </div>
      
      <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto">
        <BookingList 
            title="이번 주 예약"
            bookings={userBookingsThisWeek}
            remaining={2 - userBookingsThisWeek.length}
            onCancel={onCancelBooking}
            getMasseuseName={getMasseuseName}
        />
        <div className="border-t border-slate-200 my-2"></div>
         <BookingList 
            title="다음 주 예약"
            bookings={userBookingsNextWeek}
            remaining={2 - userBookingsNextWeek.length}
            onCancel={onCancelBooking}
            getMasseuseName={getMasseuseName}
        />
        {cancelledNotifications.length > 0 && (
          <div className="pt-4 border-t border-slate-200">
              <h4 className="font-bold text-amber-700 mb-2">취소된 예약 알림</h4>
              <ul className="space-y-2">
                  {cancelledNotifications.map(n => (
                      <li key={n.id} className="flex items-start justify-between bg-amber-50 p-3 rounded-lg">
                          <div>
                              <p className="font-semibold text-sm text-amber-800">{getMasseuseName(n.masseuseId)} - {parseISODate(n.date).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })} {n.time}</p>
                              <p className="text-xs text-amber-600">{n.reason}으로 자동 취소됨</p>
                          </div>
                           <button 
                              onClick={() => onDismissNotification(n.id)}
                              className="p-1 rounded-full text-slate-500 hover:bg-slate-200 transition-colors flex-shrink-0 ml-2"
                              aria-label="Dismiss notification"
                          >
                              <XIcon className="h-4 w-4" />
                          </button>
                      </li>
                  ))}
              </ul>
          </div>
        )}
      </div>
    </div>
  );
};
