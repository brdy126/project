
export const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay(); // Sunday: 0, Monday: 1, ...
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const start = new Date(d.setDate(diff));
  start.setHours(0, 0, 0, 0);
  return start;
};

export const getEndOfWeek = (date: Date): Date => {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
};

export const getWeekDays = (date: Date): Date[] => {
  const startOfWeek = getStartOfWeek(date);
  const weekDays: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    weekDays.push(day);
  }
  return weekDays;
};

export const getWorkWeekDays = (date: Date): Date[] => {
    const startOfWeek = getStartOfWeek(date);
    const workDays: Date[] = [];
    for (let i = 0; i < 5; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        workDays.push(day);
    }
    return workDays;
};

export const getBookableDays = (startDate: Date, publicHolidays: string[]): Date[] => {
    const bookableDays: Date[] = [];
    const dayLimit = 8;
    let daysAdded = 0;
    let daysChecked = 0;
    let currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);

    while (daysAdded < dayLimit && daysChecked < 30) { 
        const dayOfWeek = currentDate.getDay();
        const isoDate = formatToISODate(currentDate);

        if (dayOfWeek !== 0 && dayOfWeek !== 6 && !publicHolidays.includes(isoDate)) {
            bookableDays.push(new Date(currentDate));
            daysAdded++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
        daysChecked++;
    }
    return bookableDays;
};

export const isSameDay = (d1: Date, d2: Date): boolean => {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

export const formatToISODate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseISODate = (isoDate: string): Date => {
    const [year, month, day] = isoDate.split('-').map(Number);
    return new Date(year, month - 1, day);
};

export const isPastTime = (date: Date, time: string): boolean => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const slotDateTime = new Date(date);
    slotDateTime.setHours(hours, minutes, 0, 0);
    return slotDateTime < now;
};
