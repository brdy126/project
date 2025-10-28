
import { useState, useEffect, useCallback } from 'react';
import { Booking, CancelledBookingNotification, HolidaySchedule, HolidayType } from '../types';
import * as api from '../services/api';
import { formatToISODate, getStartOfWeek, getEndOfWeek, parseISODate } from '../utils/dateUtils';

// FIX: Removed the `onHolidayCycle` parameter as it was unused and causing a type error.
export const useBookings = (
  holidays: HolidaySchedule
) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cancellationNotifications, setCancellationNotifications] = useState<CancelledBookingNotification[]>([]);

  useEffect(() => {
    const fetchBookings = async () => {
      const data = await api.getBookings();
      setBookings(data);
    };
    fetchBookings();
  }, []);

  const addBooking = useCallback(async (userId: string, masseuseId: string, date: Date, time: string) => {
    const newBooking = await api.addBooking(userId, masseuseId, formatToISODate(date), time);
    setBookings(prev => [...prev, newBooking]);
  }, []);

  const cancelBooking = useCallback(async (bookingId: string) => {
    await api.removeBooking(bookingId);
    setBookings(prev => prev.filter(b => b.id !== bookingId));
  }, []);

  const dismissNotification = (bookingId: string) => {
    setCancellationNotifications(prev => prev.filter(n => n.id !== bookingId));
  };

  const validateBooking = (userId: string, masseuseId: string, date: Date, time: string): string | null => {
    const isoDate = formatToISODate(date);
    if (bookings.some(b => b.userId === userId && b.date === isoDate)) {
      return '하루에 한 번만 예약할 수 있습니다.';
    }
    
    const bookingWeekStart = getStartOfWeek(date);
    const bookingWeekEnd = getEndOfWeek(date);
    const bookingsInSameWeek = bookings.filter(b => {
      if (b.userId !== userId) return false;
      const bookingDate = parseISODate(b.date);
      return bookingDate >= bookingWeekStart && bookingDate <= bookingWeekEnd;
    });

    if (bookingsInSameWeek.length >= 2) {
      return '한 주에 2번까지만 예약할 수 있습니다.';
    }

    if (bookingsInSameWeek.some(b => b.masseuseId === masseuseId)) {
      return '같은 주임님에게 주 2회 리프레시 이용이 불가합니다.';
    }

    return null;
  };

  useEffect(() => {
    // This effect handles automatic cancellation when holidays change.
    // It's a simplified approach; a more robust solution might involve server-side logic.
    const checkBookingsAgainstHolidays = () => {
      const bookingsToCancel: Booking[] = [];
      const newNotifications: CancelledBookingNotification[] = [];

      bookings.forEach(booking => {
        const holidayType = holidays[booking.masseuseId]?.[booking.date];
        if (!holidayType) return;
        
        let shouldCancel = false;
        let reason = '';
        const slotHour = parseInt(booking.time.split(':')[0], 10);

        if (holidayType === 'full') {
            shouldCancel = true;
            reason = '담당자 종일 휴무';
        } else if (holidayType === 'am' && slotHour < 13) {
            shouldCancel = true;
            reason = '담당자 오전 반차';
        } else if (holidayType === 'pm' && slotHour >= 13) {
            shouldCancel = true;
            reason = '담당자 오후 반차';
        }
        
        if (shouldCancel) {
            bookingsToCancel.push(booking);
            newNotifications.push({ ...booking, reason });
        }
      });

      if (bookingsToCancel.length > 0) {
        setBookings(prev => prev.filter(b => !bookingsToCancel.some(cancelled => cancelled.id === b.id)));
        setCancellationNotifications(prev => [...prev.filter(n => !bookingsToCancel.some(cancelled => cancelled.id === n.id)), ...newNotifications]);
        bookingsToCancel.forEach(b => api.removeBooking(b.id));
      }
    };
    
    checkBookingsAgainstHolidays();
    // FIX: Added `bookings` to dependency array to prevent stale state issues when checking for cancellations.
  }, [holidays, bookings]);

  return { bookings, addBooking, cancelBooking, cancellationNotifications, dismissNotification, validateBooking };
};
