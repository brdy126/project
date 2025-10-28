
import React, { useState, useMemo } from 'react';
import { Masseuse, Booking, User, SlotToBook, HolidayType, HolidaySchedule, CancelledBookingNotification } from './types';
import { MASSEUSES, CURRENT_USER, PUBLIC_HOLIDAYS } from './constants';
import { getWorkWeekDays, getStartOfWeek, getEndOfWeek, isSameDay, formatToISODate, isPastTime, getBookableDays, parseISODate } from './utils/dateUtils';
import { WeekNavigator } from './components/WeekNavigator';
import { WeekTimeTable } from './components/TimeTable';
import { BookingSummary } from './components/BookingSummary';
import { ConfirmationModal } from './components/ConfirmationModal';

type ViewMode = 'user' | 'admin';

const ViewSwitcher: React.FC<{ viewMode: ViewMode; onViewChange: (mode: ViewMode) => void; }> = ({ viewMode, onViewChange }) => {
  return (
    <div className="flex bg-slate-200 rounded-lg p-1 w-full sm:w-auto">
      <button
        onClick={() => onViewChange('user')}
        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors w-full ${viewMode === 'user' ? 'bg-white text-teal-600 shadow' : 'text-slate-600'}`}
      >
        사용자
      </button>
      <button
        onClick={() => onViewChange('admin')}
        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors w-full ${viewMode === 'admin' ? 'bg-white text-teal-600 shadow' : 'text-slate-600'}`}
      >
        관리자
      </button>
    </div>
  );
};

const AdminView: React.FC<{
  currentDate: Date;
  onWeekChange: (direction: 'prev' | 'next') => void;
  masseuses: Masseuse[];
  holidays: HolidaySchedule;
  onCycleHoliday: (masseuseId: string, date: Date) => void;
}> = ({ currentDate, onWeekChange, masseuses, holidays, onCycleHoliday }) => {
  const [selectedAdminId, setSelectedAdminId] = useState(masseuses[0].id);
  const workWeekDays = getWorkWeekDays(currentDate);
  const dayNames = ['월', '화', '수', '목', '금'];
  const adminHolidays = holidays[selectedAdminId] || {};

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
      <WeekNavigator currentDate={currentDate} onWeekChange={onWeekChange} />
      <div className="bg-white p-4 rounded-xl shadow-md">
        <h3 className="text-lg font-bold mb-4 text-slate-700">휴일 설정</h3>
        <p className="text-sm text-slate-500 mb-4">날짜를 클릭하여 근무, 종일 휴무, 오전/오후 반차 순으로 상태를 변경하세요.</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {workWeekDays.map((day, index) => {
            const isoDate = formatToISODate(day);
            const holidayType = adminHolidays[isoDate];
            const isPast = isPastTime(day, '23:59');
            const isPublicHoliday = PUBLIC_HOLIDAYS.includes(isoDate);

            let statusText = '근무';
            let buttonClass = 'flex flex-col items-center p-3 rounded-lg transition-colors border-2 ';
            
            if (isPublicHoliday) {
                statusText = '공휴일';
                buttonClass += 'bg-gray-200 text-gray-500 cursor-not-allowed border-gray-300';
            } else if (isPast) {
              buttonClass += 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200';
              statusText = holidayType ? '휴일' : '지나감';
            } else {
                if (!holidayType) {
                    statusText = '근무';
                    buttonClass += 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100';
                } else if (holidayType === 'full') {
                    statusText = '종일 휴무';
                    buttonClass += 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200';
                } else if (holidayType === 'am') {
                    statusText = '오전 반차';
                    buttonClass += 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200';
                } else if (holidayType === 'pm') {
                    statusText = '오후 반차';
                    buttonClass += 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200';
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

export default function App() {
  const currentUser = CURRENT_USER;
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [adminCurrentDate, setAdminCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [slotToBook, setSlotToBook] = useState<SlotToBook | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('user');
  const [holidays, setHolidays] = useState<HolidaySchedule>({});
  const [cancellationNotifications, setCancellationNotifications] = useState<CancelledBookingNotification[]>([]);


  const availableDays = useMemo(() => getBookableDays(new Date(), PUBLIC_HOLIDAYS), []);

  const handleAdminWeekChange = (direction: 'prev' | 'next') => {
    setAdminCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + (direction === 'prev' ? -7 : 7));
      return newDate;
    });
  };
  
  const handleCancelBooking = (bookingId: string) => {
    setBookings(prev => prev.filter(b => b.id !== bookingId));
  };
  
  const handleCycleHoliday = (masseuseId: string, date: Date) => {
    const isoDate = formatToISODate(date);
    const currentType = holidays[masseuseId]?.[isoDate];

    let nextType: HolidayType | null = null;
    let reasonText = '';
    if (!currentType) { nextType = 'full'; reasonText = '종일 휴무'; }
    else if (currentType === 'full') { nextType = 'am'; reasonText = '오전 반차'; }
    else if (currentType === 'am') { nextType = 'pm'; reasonText = '오후 반차'; }
    else if (currentType === 'pm') { nextType = null; }

    setHolidays(prev => {
        const newHolidays = { ...prev };
        const masseuseHolidays = { ...(newHolidays[masseuseId] || {}) };
        
        if (nextType) {
            masseuseHolidays[isoDate] = nextType;
        } else {
            delete masseuseHolidays[isoDate];
        }

        if (Object.keys(masseuseHolidays).length > 0) {
            newHolidays[masseuseId] = masseuseHolidays;
        } else {
            delete newHolidays[masseuseId];
        }
        return newHolidays;
    });

    setBookings(prevBookings => {
      const bookingsToCancel = prevBookings.filter(b => {
        if (b.masseuseId !== masseuseId || b.date !== isoDate) {
          return false;
        }
        if (!nextType) return false;
        if (nextType === 'full') return true;

        const slotHour = parseInt(b.time.split(':')[0], 10);
        if (nextType === 'am' && slotHour < 13) return true;
        if (nextType === 'pm' && slotHour >= 13) return true;
        
        return false;
      });

      if (bookingsToCancel.length > 0) {
        const newNotifications: CancelledBookingNotification[] = bookingsToCancel.map(b => ({
          ...b,
          reason: `담당자 ${reasonText}`
        }));
        setCancellationNotifications(prev => [...prev, ...newNotifications]);
      }

      return prevBookings.filter(b => !bookingsToCancel.some(cancelled => cancelled.id === b.id));
    });
  };

  const handleDismissNotification = (bookingId: string) => {
    setCancellationNotifications(prev => prev.filter(n => n.id !== bookingId));
  };

  const handleBookSlot = (masseuseId: string, date: Date, time: string) => {
    const masseuse = MASSEUSES.find(m => m.id === masseuseId)!;

    if (bookings.some(b => b.userId === currentUser.id && b.date === formatToISODate(date))) {
      alert('하루에 한 번만 예약할 수 있습니다.');
      return;
    }

    const bookingWeekStart = getStartOfWeek(date);
    const bookingWeekEnd = getEndOfWeek(date);
    const bookingsInSameWeek = bookings.filter(b => {
      if (b.userId !== currentUser.id) return false;
      const bookingDate = parseISODate(b.date);
      return bookingDate >= bookingWeekStart && bookingDate <= bookingWeekEnd;
    });

    if (bookingsInSameWeek.length >= 2) {
      alert('한 주에 2번까지만 예약할 수 있습니다.');
      return;
    }

    if (bookingsInSameWeek.some(b => b.masseuseId === masseuseId)) {
      alert('같은 주임님에게 주 2회 리프레시 이용이 불가합니다.');
      return;
    }

    setSlotToBook({ masseuse, date, time });
    setIsModalOpen(true);
  };
  
  const confirmBooking = () => {
      if (!slotToBook) return;
      const newBooking: Booking = {
          id: `${Date.now()}-${Math.random()}`,
          userId: currentUser.id,
          masseuseId: slotToBook.masseuse.id,
          date: formatToISODate(slotToBook.date),
          time: slotToBook.time,
      };
      setBookings(prev => [...prev, newBooking]);
      setIsModalOpen(false);
      setSlotToBook(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-teal-600">마사지 예약 시스템</h1>
            <p className="text-slate-500 mt-1">
              {viewMode === 'user' ? '오늘부터 예약 가능한 날짜의 스케줄입니다.' : '관리자 페이지: 마사지사 휴일을 설정하세요.'}
            </p>
          </div>
          <ViewSwitcher viewMode={viewMode} onViewChange={setViewMode} />
        </header>
      </div>

      <main>
        {viewMode === 'admin' ? (
          <AdminView
            currentDate={adminCurrentDate}
            onWeekChange={handleAdminWeekChange}
            masseuses={MASSEUSES}
            holidays={holidays}
            onCycleHoliday={handleCycleHoliday}
          />
        ) : (
          <>
            <WeekTimeTable
              scheduleDays={availableDays}
              masseuses={MASSEUSES}
              bookings={bookings}
              holidays={holidays}
              currentUser={currentUser}
              onBookSlot={handleBookSlot}
            />
            <BookingSummary 
              bookings={bookings} 
              currentUser={currentUser} 
              masseuses={MASSEUSES} 
              onCancelBooking={handleCancelBooking}
              cancelledNotifications={cancellationNotifications.filter(n => n.userId === currentUser.id)}
              onDismissNotification={handleDismissNotification}
            />
          </>
        )}
      </main>
      
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmBooking}
        slotToBook={slotToBook}
      />
    </div>
  );
}