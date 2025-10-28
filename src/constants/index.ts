
import { Masseuse, User } from '../types';

export const MASSEUSES: Masseuse[] = [
  { id: '1', name: '이춘희', specialty: '스웨디시 마사지', imageUrl: 'https://picsum.photos/seed/chunhee/300/300' },
  { id: '2', name: '최덕삼', specialty: '딥티슈 마사지', imageUrl: 'https://picsum.photos/seed/deoksam/300/300' },
  { id: '3', name: '홍주희', specialty: '아로마 테라피', imageUrl: 'https://picsum.photos/seed/juhee/300/300' },
];

export const ALL_USERS: User[] = [
  { id: 'user1', name: '김예약' },
  { id: 'user2', name: '박선호' },
  { id: 'user3', name: '이민준' },
  { id: 'user4', name: '최유리' },
];

export const CURRENT_USER: User = ALL_USERS[0];

export const TIME_SLOTS_DETAILS: { session: string; time: string; display: string }[] = [
    { session: '1차', time: '10:00', display: '10:00-10:20' },
    { session: '2차', time: '10:40', display: '10:40-11:00' },
    { session: '3차', time: '11:20', display: '11:20-11:40' },
    { session: '4차', time: '12:00', display: '12:00-12:20' },
    { session: '5차', time: '12:40', display: '12:40-13:00' },
    { session: '6차', time: '13:20', display: '13:20-13:40' },
    { session: '7차', time: '14:00', display: '14:00-14:20' },
    { session: '8차', time: '14:40', display: '14:40-15:00' },
    { session: '9차', time: '15:20', display: '15:20-15:40' },
    { session: '10차', time: '16:00', display: '16:00-16:20' },
    { session: '11차', time: '16:40', display: '16:40-17:00' },
    { session: '12차', time: '17:20', display: '17:20-17:40' }
];

export const TIME_SLOTS: string[] = TIME_SLOTS_DETAILS.map(slot => slot.time);

// South Korean Public Holidays for 2025
export const PUBLIC_HOLIDAYS: string[] = [
  '2025-01-01', '2025-01-28', '2025-01-29', '2025-01-30', '2025-03-01',
  '2025-05-05', '2025-05-06', '2025-06-06', '2025-08-15', '2025-10-03',
  '2025-10-05', '2025-10-06', '2025-10-07', '2025-10-09', '2025-12-25',
];
