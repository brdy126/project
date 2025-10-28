
import React, { useMemo } from 'react';
import { Booking, CancelledBookingNotification, HolidaySchedule, Masseuse, User } from '../types';
import { WeekTimeTable } from '../components/TimeTable';
import { BookingSummary } from '../components/BookingSummary';
import { getBookableDays } from '../utils/dateUtils';
import { PUBLIC_HOLIDAYS } from '../constants';

interface UserViewProps {
    currentUser: User;
    masseuses: Masseuse[];
    bookings: Booking[];
    holidays: HolidaySchedule;
    cancellationNotifications: CancelledBookingNotification[];
    onBookSlot: (masseuseId: string, date: Date, time: string) => void;
    onCancelBooking: (bookingId: string) => void;
    onDismissNotification: (bookingId: string) => void;
}

export const UserView: React.FC<UserViewProps> = (props) => {
    const { 
        currentUser, 
        masseuses, 
        bookings, 
        holidays, 
        cancellationNotifications, 
        onBookSlot, 
        onCancelBooking, 
        onDismissNotification 
    } = props;
    
    const availableDays = useMemo(() => getBookableDays(new Date(), PUBLIC_HOLIDAYS), []);

    return (
        <>
            <WeekTimeTable
                scheduleDays={availableDays}
                masseuses={masseuses}
                bookings={bookings}
                holidays={holidays}
                currentUser={currentUser}
                onBookSlot={onBookSlot}
            />
            <BookingSummary
                bookings={bookings}
                currentUser={currentUser}
                masseuses={masseuses}
                onCancelBooking={onCancelBooking}
                cancelledNotifications={cancellationNotifications.filter(n => n.userId === currentUser.id)}
                onDismissNotification={onDismissNotification}
            />
        </>
    );
};
