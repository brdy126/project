import React, { useState, useMemo } from 'react';
import { Masseuse, Booking, User, SlotToBook } from './types';
import { MASSEUSES, USERS } from './constants';
import { getWorkWeekDays, getStartOfWeek, getEndOfWeek, isSameDay, formatToISODate, isPastTime } from './utils/dateUtils';
import { MasseuseSelector } from './components/MasseuseSelector';
import { WeekNavigator } from './components/WeekNavigator';
import { WeekTimeTable } from './components/TimeTable';
import { BookingSummary } from './components/BookingSummary';
import { UserSwitcher } from './components/UserSwitcher';
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
  holidays: Record<string, string[]>;
  onToggleHoliday: (masseuseId: string, date: Date) => void;
}> = ({ currentDate, onWeekChange, masseuses, holidays, onToggleHoliday }) => {
  const [selectedAdminId, setSelectedAdminId] = useState(masseuses[0].id);
  const workWeekDays = getWorkWeekDays(currentDate);
  const dayNames = ['월', '화', '수', '목', '금'];
  const adminHolidays = holidays[selectedAdminId] || [];

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
        <p className="text-sm text-slate-500 mb-4">날짜를 클릭하여 휴일로 설정하거나 해제하세요.</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {workWeekDays.map((day, index) => {
            const isoDate = formatToISODate(day);
            const isHoliday = adminHolidays.includes(isoDate);
            const isPast = isPastTime(day, '23:59');
            let buttonClass = 'flex flex-col items-center p-3 rounded-lg transition-colors border-2 ';
            if (isPast) buttonClass += 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200';
            else if (isHoliday) buttonClass += 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200';
            else buttonClass += 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100';
            return (
              <button key={isoDate} disabled={isPast} onClick={() => onToggleHoliday(selectedAdminId, day)} className={buttonClass}>
                <span className="font-semibold">{dayNames[index]}</span>
                <span className="text-lg mt-1">{day.getDate()}</span>
                <span className="text-xs mt-2 font-bold">{isHoliday ? '휴일' : '근무'}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(USERS[0]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedMasseuseId, setSelectedMasseuseId] = useState<string>(MASSEUSES[0].id);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [slotToBook, setSlotToBook] = useState<SlotToBook | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('user');
  const [holidays, setHolidays] = useState<Record<string, string[]>>({});

  const selectedMasseuse = useMemo(() => MASSEUSES.find(m => m.id === selectedMasseuseId)!, [selectedMasseuseId]);
  const workWeekDays = useMemo(() => getWorkWeekDays(currentDate), [currentDate]);

  const handleUserChange = (userId: string) => {
    const user = USERS.find(u => u.id === userId);
    if (user) setCurrentUser(user);
  };

  const handleWeekChange = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + (direction === 'prev' ? -7 : 7));
      return newDate;
    });
  };
  
  const handleCancelBooking = (bookingId: string) => {
    setBookings(prev => prev.filter(b => b.id !== bookingId));
  };
  
  const handleToggleHoliday = (masseuseId: string, date: Date) => {
    const isoDate = formatToISODate(date);
    setHolidays(prev => {
      const currentHolidays = prev[masseuseId] || [];
      const newHolidays = currentHolidays.includes(isoDate)
        ? currentHolidays.filter(d => d !== isoDate)
        : [...currentHolidays, isoDate];
      return { ...prev, [masseuseId]: newHolidays };
    });
  };

  const handleBookSlot = (date: Date, time: string) => {
    const startOfWeek = getStartOfWeek(date);
    const endOfWeek = getEndOfWeek(date);
    const userBookingsThisWeek = bookings.filter(b => {
        const bookingDate = new Date(b.date);
        return b.userId === currentUser.id && bookingDate >= startOfWeek && bookingDate <= endOfWeek;
    });

    if (userBookingsThisWeek.length >= 2) {
        alert('한 주에 2번까지만 예약할 수 있습니다.'); return;
    }
    if (userBookingsThisWeek.some(b => isSameDay(new Date(b.date), date))) {
        alert('하루에 2번 예약할 수 없습니다.'); return;
    }
    if (userBookingsThisWeek.some(b => b.masseuseId === selectedMasseuse.id)) {
        alert('같은 마사지사에게는 주 1회만 예약할 수 있습니다.'); return;
    }

    setSlotToBook({ masseuse: selectedMasseuse, date: date, time });
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
              {viewMode === 'user' ? '원하는 마사지사와 시간을 선택하여 예약하세요.' : '관리자 페이지: 마사지사 휴일을 설정하세요.'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {viewMode === 'user' && <UserSwitcher users={USERS} currentUser={currentUser} onUserChange={handleUserChange} />}
            <ViewSwitcher viewMode={viewMode} onViewChange={setViewMode} />
          </div>
        </header>

        <main>
          {viewMode === 'admin' ? (
            <AdminView
              currentDate={currentDate}
              onWeekChange={handleWeekChange}
              masseuses={MASSEUSES}
              holidays={holidays}
              onToggleHoliday={handleToggleHoliday}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <MasseuseSelector masseuses={MASSEUSES} selectedMasseuseId={selectedMasseuseId} onSelect={setSelectedMasseuseId} />
                <WeekNavigator currentDate={currentDate} onWeekChange={handleWeekChange} />
                <WeekTimeTable
                  workWeekDays={workWeekDays}
                  masseuseId={selectedMasseuseId}
                  bookings={bookings}
                  holidays={holidays}
                  onBookSlot={handleBookSlot}
                />
              </div>
              <div className="lg:col-span-1">
                <BookingSummary bookings={bookings} currentUser={currentUser} masseuses={MASSEUSES} onCancelBooking={handleCancelBooking} />
              </div>
            </div>
          )}
        </main>
      </div>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmBooking}
        slotToBook={slotToBook}
      />
    </div>
  );
}