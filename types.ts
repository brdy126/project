
export interface Masseuse {
  id: string;
  name: string;
  specialty: string;
  imageUrl: string;
}

export interface Booking {
  id: string;
  userId: string;
  masseuseId: string;
  date: string; // ISO string for date
  time: string; // e.g., "09:00"
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
