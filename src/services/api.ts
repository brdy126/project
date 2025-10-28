
import { Booking, HolidaySchedule, HolidayType } from '../types';
import { ALL_USERS, CURRENT_USER } from '../constants';

// --- Mock Database ---
let bookings: Booking[] = [
    // Pre-populate with some bookings from other users for demonstration
    { id: 'mock1', userId: 'user2', userName: '박선호', masseuseId: '1', date: '2025-10-28', time: '10:00' },
    { id: 'mock2', userId: 'user3', userName: '이민준', masseuseId: '2', date: '2025-10-28', time: '10:40' },
    { id: 'mock3', userId: 'user4', userName: '최유리', masseuseId: '1', date: '2025-10-29', time: '11:20' },
];
let holidays: HolidaySchedule = {};

const simulateLatency = (data: any) => new Promise(resolve => setTimeout(() => resolve(data), 200));

// --- API Functions ---

export const getBookings = async (): Promise<Booking[]> => {
    return simulateLatency([...bookings]) as Promise<Booking[]>;
};

export const addBooking = async (userId: string, masseuseId: string, date: string, time: string): Promise<Booking> => {
    const user = ALL_USERS.find(u => u.id === userId);
    if (!user) throw new Error("User not found");

    const newBooking: Booking = {
        id: `${Date.now()}-${Math.random()}`,
        userId,
        userName: user.name,
        masseuseId,
        date,
        time,
    };
    bookings.push(newBooking);
    return simulateLatency(newBooking) as Promise<Booking>;
};

export const removeBooking = async (bookingId: string): Promise<{ success: true }> => {
    bookings = bookings.filter(b => b.id !== bookingId);
    return simulateLatency({ success: true }) as Promise<{ success: true }>;
};

export const getHolidays = async (): Promise<HolidaySchedule> => {
    return simulateLatency({ ...holidays }) as Promise<HolidaySchedule>;
};

export const setHoliday = async (masseuseId: string, isoDate: string, nextType: HolidayType | null): Promise<HolidaySchedule> => {
    const newHolidays = { ...holidays };
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
    holidays = newHolidays;
    return simulateLatency({ ...holidays }) as Promise<HolidaySchedule>;
};
