import React, { useCallback } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface TimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  minTime?: string;
  maxTime?: string;
}

const TimePicker: React.FC<TimePickerProps> = ({ 
  value, 
  onChange, 
  minTime = '07:00', 
  maxTime = '22:00' 
}) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  const currentHour = value.getHours();
  const currentMinute = Math.floor(value.getMinutes() / 5) * 5;

  const handleHourChange = useCallback((hour: number) => {
    const newDate = new Date(value);
    newDate.setHours(hour);
    onChange(newDate);
  }, [value, onChange]);

  const handleMinuteChange = useCallback((minute: number) => {
    const newDate = new Date(value);
    newDate.setMinutes(minute);
    onChange(newDate);
  }, [value, onChange]);

  const incrementHour = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newHour = (currentHour + 1) % 24;
    handleHourChange(newHour);
  }, [currentHour, handleHourChange]);

  const decrementHour = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newHour = (currentHour - 1 + 24) % 24;
    handleHourChange(newHour);
  }, [currentHour, handleHourChange]);

  const incrementMinute = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newMinute = (Math.floor(currentMinute / 5) * 5 + 5) % 60;
    handleMinuteChange(newMinute);
  }, [currentMinute, handleMinuteChange]);

  const decrementMinute = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newMinute = (Math.floor(currentMinute / 5) * 5 - 5 + 60) % 60;
    handleMinuteChange(newMinute);
  }, [currentMinute, handleMinuteChange]);

  const handleHourSelectChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleHourChange(parseInt(e.target.value));
  }, [handleHourChange]);

  const handleMinuteSelectChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleMinuteChange(parseInt(e.target.value));
  }, [handleMinuteChange]);

  return (
    <div className="tw-flex tw-items-center tw-space-x-2">
      <div className="tw-relative tw-flex tw-flex-col tw-items-center">
        <button
          type="button"
          onClick={incrementHour}
          className="tw-p-1 hover:tw-bg-gray-100 tw-rounded-full"
        >
          <ChevronUp size={16} />
        </button>
        <select
          value={currentHour}
          onChange={handleHourSelectChange}
          className="tw-appearance-none tw-w-16 tw-text-center tw-py-1 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 tw-text-sm"
          onClick={(e) => e.stopPropagation()}
        >
          {hours.map((hour) => (
            <option key={hour} value={hour}>
              {hour.toString().padStart(2, '0')}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={decrementHour}
          className="tw-p-1 hover:tw-bg-gray-100 tw-rounded-full"
        >
          <ChevronDown size={16} />
        </button>
      </div>
      <span className="tw-text-xl tw-font-bold">:</span>
      <div className="tw-relative tw-flex tw-flex-col tw-items-center">
        <button
          type="button"
          onClick={incrementMinute}
          className="tw-p-1 hover:tw-bg-gray-100 tw-rounded-full"
        >
          <ChevronUp size={16} />
        </button>
        <select
          value={currentMinute}
          onChange={handleMinuteSelectChange}
          className="tw-appearance-none tw-w-16 tw-text-center tw-py-1 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 tw-text-sm"
          onClick={(e) => e.stopPropagation()}
        >
          {minutes.map((minute) => (
            <option key={minute} value={minute}>
              {minute.toString().padStart(2, '0')}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={decrementMinute}
          className="tw-p-1 hover:tw-bg-gray-100 tw-rounded-full"
        >
          <ChevronDown size={16} />
        </button>
      </div>
    </div>
  );
};

export default TimePicker;