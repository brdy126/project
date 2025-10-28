
export interface Masseuse {
  id: string;
  name: string;
  specialty: string;
  imageUrl: string;
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  masseuseId: string;
  date: string; // ISO string for date "YYYY-MM-DD"
  time: string; // e.g., "10:00"
}

export interface User {
  id: string;
  name: string;
}

export interface SlotToBook {
    masseuse: Masseuse;
    date: Date;
    time: string;
}

export type HolidayType = 'full' | 'am' | 'pm';

export type HolidaySchedule = Record<string, Record<string, HolidayType>>;

export interface CancelledBookingNotification extends Booking {
  reason: string;
}
