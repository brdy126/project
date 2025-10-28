
import { Masseuse, User } from './types';

export const MASSEUSES: Masseuse[] = [
  {
    id: '1',
    name: '김가나',
    specialty: '스웨디시 마사지',
    imageUrl: 'https://picsum.photos/seed/gana/300/300',
  },
  {
    id: '2',
    name: '홍길동',
    specialty: '딥티슈 마사지',
    imageUrl: 'https://picsum.photos/seed/gildong/300/300',
  },
  {
    id: '3',
    name: '김옥순',
    specialty: '아로마 테라피',
    imageUrl: 'https://picsum.photos/seed/oksoon/300/300',
  },
  {
    id: '4',
    name: '김영동',
    specialty: '스포츠 마사지',
    imageUrl: 'https://picsum.photos/seed/youngdong/300/300',
  },
];

export const USERS: User[] = [
    { id: 'user1', name: '사용자 A' },
    { id: 'user2', name: '사용자 B' },
];

export const TIME_SLOTS: string[] = [
  '09:00', '10:00', '11:00', '12:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00'
];
