import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { ViewType } from '../types';

// Set locale to Chinese
dayjs.locale('zh-cn');

export const formatDate = (date: string | Date) => {
  return dayjs(date).format('YYYY-MM-DD');
};

export const formatDateTime = (date: string | Date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

export const formatTime = (date: string | Date) => {
  return dayjs(date).format('HH:mm');
};

export const parseDate = (dateStr: string) => {
  return dayjs(dateStr).toDate();
};

export const addMinutes = (date: Date | string, minutes: number) => {
  return dayjs(date).add(minutes, 'minute').toDate();
};

export const getStartOfDay = (date: Date) => {
  return dayjs(date).startOf('day').toDate();
};

export const getEndOfDay = (date: Date) => {
  return dayjs(date).endOf('day').toDate();
};

export const formatTimeRange = (start: Date | string, end: Date | string) => {
  return `${formatTime(start)}-${formatTime(end)}`;
};

export const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours > 0 ? `${hours}小时` : ''}${mins > 0 ? `${mins}分钟` : ''}`;
};

export const getDateRange = (date: Date, viewType: ViewType) => {
  const currentDate = dayjs(date);
  
  switch (viewType) {
    case 'day':
      return {
        startDate: currentDate.startOf('day').toDate(),
        endDate: currentDate.endOf('day').toDate()
      };
    case 'week':
      return {
        startDate: currentDate.startOf('week').toDate(),
        endDate: currentDate.endOf('week').toDate()
      };
    case 'month':
      return {
        startDate: currentDate.startOf('month').toDate(),
        endDate: currentDate.endOf('month').toDate()
      };
    default:
      return {
        startDate: currentDate.startOf('day').toDate(),
        endDate: currentDate.endOf('day').toDate()
      };
  }
};

export const formatDateRange = (startDate: Date, endDate: Date) => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  
  if (start.isSame(end, 'day')) {
    return start.format('YYYY年MM月DD日');
  }
  
  if (start.isSame(end, 'month')) {
    return `${start.format('YYYY年MM月DD日')}-${end.format('DD日')}`;
  }
  
  if (start.isSame(end, 'year')) {
    return `${start.format('YYYY年MM月DD日')}-${end.format('MM月DD日')}`;
  }
  
  return `${start.format('YYYY年MM月DD日')}-${end.format('YYYY年MM月DD日')}`;
};