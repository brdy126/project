
import { useState, useEffect, useCallback } from 'react';
import { HolidaySchedule, HolidayType } from '../types';
import * as api from '../services/api';
import { formatToISODate } from '../utils/dateUtils';

export const useHolidays = () => {
  const [holidays, setHolidays] = useState<HolidaySchedule>({});

  useEffect(() => {
    const fetchHolidays = async () => {
      const data = await api.getHolidays();
      setHolidays(data);
    };
    fetchHolidays();
  }, []);
  
  const cycleHoliday = useCallback(async (masseuseId: string, date: Date) => {
    const isoDate = formatToISODate(date);
    const currentType = holidays[masseuseId]?.[isoDate];

    let nextType: HolidayType | null = null;
    let reasonText = '';
    
    if (!currentType) { nextType = 'full'; reasonText = '종일 휴무'; }
    else if (currentType === 'full') { nextType = 'am'; reasonText = '오전 반차'; }
    else if (currentType === 'am') { nextType = 'pm'; reasonText = '오후 반차'; }
    else if (currentType === 'pm') { nextType = null; reasonText = '근무'; }

    const updatedHolidays = await api.setHoliday(masseuseId, isoDate, nextType);
    setHolidays(updatedHolidays);

    return { nextType, reasonText };
  }, [holidays]);

  return { holidays, cycleHoliday };
};
