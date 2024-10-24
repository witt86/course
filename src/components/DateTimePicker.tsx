import React, { useState, useCallback } from 'react';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import DatePicker from './DatePicker';
import TimePicker from './TimePicker';

interface DateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  minTime?: string;
  maxTime?: string;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  minDate,
  maxDate,
  minTime,
  maxTime,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateSelect = useCallback((date: Date) => {
    const newDate = new Date(date);
    newDate.setHours(value.getHours(), value.getMinutes());
    onChange(newDate);
    setShowDatePicker(false);
  }, [value, onChange]);

  const handleTimeChange = useCallback((newTime: Date) => {
    const newDate = new Date(value);
    newDate.setHours(newTime.getHours(), newTime.getMinutes());
    onChange(newDate);
  }, [value, onChange]);

  const handleDateButtonClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDatePicker(true);
  }, []);

  return (
    <div className="tw-space-y-2">
      <div className="tw-flex tw-items-center tw-space-x-4">
        <div className="tw-flex-1">
          <div className="tw-flex tw-items-center tw-space-x-2">
            <CalendarIcon size={20} className="tw-text-gray-500" />
            <button
              type="button"
              onClick={handleDateButtonClick}
              className="tw-px-3 tw-py-1.5 tw-border tw-border-gray-300 tw-rounded-md hover:tw-bg-gray-50 tw-text-left tw-flex-1 tw-text-sm"
            >
              {value.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long',
              })}
            </button>
          </div>
        </div>
        <div className="tw-flex tw-items-center tw-space-x-2">
          <Clock size={20} className="tw-text-gray-500" />
          <TimePicker
            value={value}
            onChange={handleTimeChange}
            minTime={minTime}
            maxTime={maxTime}
          />
        </div>
      </div>

      {showDatePicker && (
        <DatePicker
          currentDate={value}
          onDateSelect={handleDateSelect}
          onClose={() => setShowDatePicker(false)}
        />
      )}
    </div>
  );
};

export default DateTimePicker;