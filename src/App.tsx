
import React, { useState } from 'react';
import { useBookings } from './hooks/useBookings';
import { useHolidays } from './hooks/useHolidays';
import { AdminView } from './views/AdminView';
import { UserView } from './views/UserView';
import { Header } from './components/Header';
import { ViewSwitcher } from './components/ViewSwitcher';
import { ConfirmationModal } from './components/ConfirmationModal';
import { MASSEUSES, CURRENT_USER } from './constants';
import { SlotToBook } from './types';

export default function App() {
  const [viewMode, setViewMode] = useState<'user' | 'admin'>('user');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [slotToBook, setSlotToBook] = useState<SlotToBook | null>(null);

  const { holidays, cycleHoliday } = useHolidays();
  const { 
    bookings, 
    addBooking, 
    cancelBooking, 
    cancellationNotifications, 
    dismissNotification, 
    validateBooking 
    // FIX: Removed `cycleHoliday` from the arguments as it's not used by `useBookings` and caused a type error.
  } = useBookings(holidays);
  
  const handleBookSlot = (masseuseId: string, date: Date, time: string) => {
    const masseuse = MASSEUSES.find(m => m.id === masseuseId)!;
    const validationError = validateBooking(CURRENT_USER.id, masseuseId, date, time);
    if (validationError) {
      alert(validationError);
      return;
    }
    setSlotToBook({ masseuse, date, time });
    setIsModalOpen(true);
  };

  const confirmBooking = () => {
    if (!slotToBook) return;
    addBooking(CURRENT_USER.id, slotToBook.masseuse.id, slotToBook.date, slotToBook.time);
    setIsModalOpen(false);
    setSlotToBook(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header viewMode={viewMode} />
        <ViewSwitcher viewMode={viewMode} onViewChange={setViewMode} />
      </div>
      <main className="max-w-7xl mx-auto mt-6">
        {viewMode === 'admin' ? (
          <AdminView
            masseuses={MASSEUSES}
            holidays={holidays}
            onCycleHoliday={cycleHoliday}
          />
        ) : (
          <UserView
            currentUser={CURRENT_USER}
            masseuses={MASSEUSES}
            bookings={bookings}
            holidays={holidays}
            cancellationNotifications={cancellationNotifications}
            onBookSlot={handleBookSlot}
            onCancelBooking={cancelBooking}
            onDismissNotification={dismissNotification}
          />
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
