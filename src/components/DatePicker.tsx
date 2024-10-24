import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  currentDate: Date;
  onDateSelect: (date: Date) => void;
  onClose: () => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ currentDate, onDateSelect, onClose }) => {
  const [viewDate, setViewDate] = useState(currentDate);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const daysInMonth = useCallback((date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }, []);

  const firstDayOfMonth = useCallback((date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  }, []);

  const handlePrevMonth = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  }, [viewDate]);

  const handleNextMonth = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  }, [viewDate]);

  const handleDateClick = useCallback((e: React.MouseEvent, day: number) => {
    e.preventDefault();
    e.stopPropagation();
    const selectedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    onDateSelect(selectedDate);
  }, [viewDate, onDateSelect]);

  const handleClose = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  const renderCalendar = useCallback(() => {
    const days = daysInMonth(viewDate);
    const firstDay = firstDayOfMonth(viewDate);
    const calendarDays = [];

    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(
        <div key={`empty-${i}`} className="tw-w-10 tw-h-10"></div>
      );
    }

    for (let day = 1; day <= days; day++) {
      const isCurrentDate = 
        day === currentDate.getDate() && 
        viewDate.getMonth() === currentDate.getMonth() && 
        viewDate.getFullYear() === currentDate.getFullYear();

      calendarDays.push(
        <button
          key={day}
          onClick={(e) => handleDateClick(e, day)}
          className={`tw-w-10 tw-h-10 tw-rounded-full tw-flex tw-items-center tw-justify-center ${
            isCurrentDate ? 'tw-bg-blue-500 tw-text-white' : 'hover:tw-bg-blue-100'
          }`}
          type="button"
        >
          {day}
        </button>
      );
    }

    return calendarDays;
  }, [viewDate, currentDate, daysInMonth, firstDayOfMonth, handleDateClick]);

  return (
    <div 
      className="tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-50 tw-flex tw-items-center tw-justify-center tw-z-50"
      onClick={handleClose}
    >
      <div 
        className={`tw-bg-white tw-rounded-lg tw-p-4 tw-shadow-xl tw-transform tw-transition-all tw-duration-300 ${
          isVisible ? 'tw-translate-y-0 tw-opacity-100' : 'tw-translate-y-full tw-opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
          <button 
            onClick={handlePrevMonth}
            className="tw-p-1 hover:tw-bg-gray-200 tw-rounded"
            type="button"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="tw-text-lg tw-font-semibold">
            {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <button 
            onClick={handleNextMonth}
            className="tw-p-1 hover:tw-bg-gray-200 tw-rounded"
            type="button"
          >
            <ChevronRight size={24} />
          </button>
        </div>
        <div className="tw-grid tw-grid-cols-7 tw-gap-1">
          {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
            <div key={day} className="tw-w-10 tw-h-10 tw-flex tw-items-center tw-justify-center tw-font-semibold">
              {day}
            </div>
          ))}
          {renderCalendar()}
        </div>
        <div className="tw-mt-4 tw-flex tw-justify-end">
          <button
            onClick={handleClose}
            className="tw-px-4 tw-py-2 tw-bg-gray-200 tw-rounded-md hover:tw-bg-gray-300"
            type="button"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatePicker;