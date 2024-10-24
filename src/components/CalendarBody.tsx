import React, { useRef, useEffect } from 'react';
import { ViewType, Course } from '../types';
import { ChevronDown } from 'lucide-react';
import { formatTimeRange } from '../utils/date';

interface CalendarBodyProps {
  viewType: ViewType;
  courses: Course[];
  currentDate: Date;
  onTimeSlotClick: (date: Date, courses: Course[]) => void;
  onCourseClick?: (course: Course) => void;
}

const CalendarBody: React.FC<CalendarBodyProps> = ({ 
  viewType, 
  courses, 
  currentDate, 
  onTimeSlotClick,
  onCourseClick 
}) => {
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (calendarRef.current) {
      const today = new Date();
      if (
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear()
      ) {
        const dayElement = calendarRef.current.querySelector(`[data-date="${today.toISOString().split('T')[0]}"]`);
        if (dayElement) {
          dayElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [viewType, currentDate]);

  const getTeacherColor = (teacherUID: string, teacherName: string) => {
    // Warm color palette with distinct combinations
    const colorPalette = [
      { bg: '#FFF5F5', border: '#FCA5A5', text: '#DC2626' }, // Warm Red
      { bg: '#FFF7ED', border: '#FDBA74', text: '#C2410C' }, // Warm Orange
      { bg: '#FFFBEB', border: '#FCD34D', text: '#B45309' }, // Warm Yellow
      { bg: '#FEF3C7', border: '#FCD34D', text: '#92400E' }, // Golden
      { bg: '#FDF4FF', border: '#F0ABFC', text: '#C026D3' }, // Warm Pink
      { bg: '#FCE7F3', border: '#F472B6', text: '#BE185D' }, // Rose
      { bg: '#FFF1F2', border: '#FDA4AF', text: '#BE123C' }, // Coral
      { bg: '#FEF2F2', border: '#FCA5A5', text: '#B91C1C' }, // Light Red
      { bg: '#FFF4ED', border: '#FFB088', text: '#C24516' }, // Peach
      { bg: '#FFF8F1', border: '#FFD7B0', text: '#B25E18' }, // Light Orange
      { bg: '#FEF9C3', border: '#FDE047', text: '#A16207' }, // Warm Yellow
      { bg: '#FAF7ED', border: '#E3D5A5', text: '#8B7355' }, // Warm Beige
      { bg: '#FFF4E6', border: '#FFB266', text: '#B35900' }, // Tangerine
      { bg: '#FFF0F0', border: '#FFADAD', text: '#CC3333' }, // Salmon
      { bg: '#FFF6E5', border: '#FFD699', text: '#B37700' }  // Light Brown
    ];

    // Generate a consistent index based on teacherUID and name
    const hash = teacherUID.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    const nameHash = teacherName.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, hash);

    // Ensure consistent color assignment for each teacher
    const index = Math.abs(nameHash) % colorPalette.length;
    return colorPalette[index];
  };

  const getMaxCoursesForTimeSlot = (days: Date[], hour: number) => {
    return days.reduce((maxCourses, day) => {
      const hourStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour);
      const hourEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour + 1);
      const hourCourses = courses.filter(
        (course) => course.startTime >= hourStart && course.startTime < hourEnd
      );
      return Math.max(maxCourses, hourCourses.length);
    }, 0);
  };

  const renderCourseCard = (course: Course) => {
    const teacherName = course.teacher?.teacherName || 'Unknown Teacher';
    const startTime = formatTimeRange(course.startTime, course.endTime);
    const colors = getTeacherColor(course.teacherUID, teacherName);

    return (
      <div
        key={course.ID}
        className="course-card tw-rounded-lg tw-shadow-sm tw-p-1.5 tw-mb-1 tw-w-full tw-text-xs tw-transition-all tw-duration-200 hover:tw-shadow-md"
        style={{
          backgroundColor: colors.bg,
          borderLeft: `2px solid ${colors.border}`,
          color: colors.text
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (onCourseClick) {
            onCourseClick(course);
          }
        }}
      >
        <div className="tw-flex tw-items-center tw-justify-between">
          <span className="tw-font-semibold tw-truncate tw-mr-1">{teacherName}</span>
          <span className="tw-truncate">{course.students.map(s => s.studentName).join(', ')}</span>
          <span className="tw-whitespace-nowrap tw-ml-1">{startTime}</span>
        </div>
      </div>
    );
  };

  const renderDayColumn = (day: Date, days: Date[]) => {
    const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 7);
    const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999);
    const dayCourses = courses.filter(
      (course) => course.startTime >= dayStart && course.startTime <= dayEnd
    );

    const hours = Array.from({ length: 17 }, (_, i) => i + 7);
    const isToday = day.toDateString() === new Date().toDateString();

    return (
      <div 
        className="tw-w-64 tw-flex-shrink-0 tw-border-r tw-border-gray-300"
        data-date={day.toISOString().split('T')[0]}
      >
        <div className={`tw-sticky tw-top-0 tw-h-16 tw-bg-white tw-z-10 tw-border-b tw-border-gray-200 tw-text-center tw-font-semibold tw-shadow-sm tw-flex tw-flex-col tw-justify-center ${isToday ? 'tw-bg-blue-100' : ''}`}>
          <div className="tw-text-sm tw-text-gray-500">
            {day.toLocaleDateString('zh-CN', { weekday: 'short' })}
          </div>
          <div className={isToday ? 'tw-text-blue-600 tw-font-bold' : ''}>
            {day.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
          </div>
        </div>
        <div className="tw-relative">
          {hours.map((hour) => {
            const hourStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour);
            const hourEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour + 1);
            const hourCourses = dayCourses.filter((course) => 
              course.startTime >= hourStart && course.startTime < hourEnd
            );

            // 动态高度计算参数
            const baseHeight = 20; // 空行最小高度
            const courseHeight = 24; // 每个课程的基础高度
            const maxCourses = 10; // 最大显示课程数
            const padding = 8; // 上下内边距总和

            // 获取当前时间段所有日期中的最大课程数
            const maxTimeSlotCourses = getMaxCoursesForTimeSlot(days, hour);
            
            // 实际显示的课程
            const displayedCourses = hourCourses.slice(0, maxCourses);
            const hiddenCount = hourCourses.length - displayedCourses.length;

            // 根据最大课程数计算行高
            const contentHeight = maxTimeSlotCourses > 0
              ? Math.min(maxTimeSlotCourses, maxCourses) * courseHeight + padding
              : baseHeight;

            return (
              <div
                key={hour}
                className="tw-relative tw-border-b tw-border-gray-200 tw-transition-all tw-duration-200"
                style={{ 
                  height: `${contentHeight}px`,
                  minHeight: `${baseHeight}px`
                }}
                onClick={() => onTimeSlotClick(hourStart, hourCourses)}
              >
                <div className="tw-absolute tw-inset-0 tw-p-1 tw-overflow-y-auto">
                  {displayedCourses.map((course) => renderCourseCard(course))}
                </div>
                {hiddenCount > 0 && (
                  <div className="tw-absolute tw-bottom-0 tw-right-0 tw-p-1">
                    <button
                      className="tw-bg-blue-100 tw-text-blue-600 hover:tw-bg-blue-200 tw-text-xs tw-px-2 tw-py-0.5 tw-rounded-full tw-flex tw-items-center tw-transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTimeSlotClick(hourStart, hourCourses);
                      }}
                    >
                      <ChevronDown size={12} className="tw-mr-1" />
                      还有 {hiddenCount} 条
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCalendar = () => {
    let days: Date[] = [];
    const startDate = new Date(currentDate);

    if (viewType === 'day') {
      days = [startDate];
    } else if (viewType === 'week') {
      startDate.setDate(startDate.getDate() - startDate.getDay());
      days = Array.from({ length: 7 }, (_, i) => {
        const day = new Date(startDate);
        day.setDate(day.getDate() + i);
        return day;
      });
    } else if (viewType === 'month') {
      startDate.setDate(1);
      const daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
      days = Array.from({ length: daysInMonth }, (_, i) => {
        const day = new Date(startDate);
        day.setDate(day.getDate() + i);
        return day;
      });
    }

    return (
      <div className="tw-flex tw-h-full" ref={calendarRef}>
        {renderTimeColumn(days)}
        <div className={`tw-flex tw-flex-1 ${viewType !== 'day' ? 'tw-overflow-x-auto' : ''}`}>
          {days.map((day, index) => (
            <div key={index} className={viewType === 'day' ? 'tw-flex-1' : ''}>
              {renderDayColumn(day, days)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTimeColumn = (days: Date[]) => {
    const hours = Array.from({ length: 17 }, (_, i) => i + 7);
    return (
      <div className="tw-sticky tw-left-0 tw-bg-white tw-z-20 tw-w-20 tw-shadow-md tw-flex-shrink-0">
        <div className="tw-h-16 tw-border-b tw-border-r tw-border-gray-200"></div>
        {hours.map((hour) => {
          const maxTimeSlotCourses = getMaxCoursesForTimeSlot(days, hour);
          const baseHeight = 20;
          const courseHeight = 24;
          const padding = 8;
          const contentHeight = maxTimeSlotCourses > 0
            ? Math.min(maxTimeSlotCourses, 10) * courseHeight + padding
            : baseHeight;

          return (
            <div 
              key={hour} 
              className="tw-border-b tw-border-r tw-border-gray-200 tw-pr-2 tw-text-sm tw-font-medium tw-text-gray-700 tw-bg-gray-50 tw-flex tw-items-center tw-justify-end"
              style={{ height: `${contentHeight}px` }}
            >
              {`${hour.toString().padStart(2, '0')}:00`}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="tw-h-full tw-overflow-hidden">
      <div className="tw-sticky tw-top-0 tw-z-30 tw-bg-white">
        {renderCalendar()}
      </div>
    </div>
  );
};

export default CalendarBody;