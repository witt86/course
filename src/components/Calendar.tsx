import React, { useState, useCallback } from 'react';
import { ViewType, Course, Teacher } from '../types';
import CalendarBody from './CalendarBody';
import EditCourseModal from './EditCourseModal';

interface CalendarProps {
  viewType: ViewType;
  courses: Course[];
  onDateChange: (date: Date) => void;
  currentDate: Date;
  filter: { type: 'teacher' | 'student' | null; value: string | null };
  teachers: Teacher[];
  onTimeSlotClick: (date: Date, courses: Course[]) => void;
  onCoursesUpdated: () => void;
}

const Calendar: React.FC<CalendarProps> = ({ 
  viewType, 
  courses, 
  currentDate, 
  filter, 
  teachers,
  onTimeSlotClick,
  onCoursesUpdated
}) => {
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const handleCourseClick = useCallback((course: Course) => {
    setEditingCourse(course);
  }, []);

  const handleEditSave = useCallback(() => {
    onCoursesUpdated();
    setEditingCourse(null);
  }, [onCoursesUpdated]);

  const handleEditDelete = useCallback((courseId: number) => {
    onCoursesUpdated();
    setEditingCourse(null);
  }, [onCoursesUpdated]);

  return (
    <div className="tw-bg-white tw-shadow-lg tw-rounded-lg tw-overflow-hidden tw-h-full tw-flex tw-flex-col">
      <div className="tw-flex-grow tw-overflow-hidden">
        <div className={`tw-h-full tw-flex calendar-wrapper ${viewType === 'day' ? 'tw-w-full' : ''}`}>
          <CalendarBody
            viewType={viewType}
            courses={courses}
            currentDate={currentDate}
            onTimeSlotClick={onTimeSlotClick}
            onCourseClick={handleCourseClick}
          />
        </div>
      </div>

      {editingCourse && (
        <EditCourseModal
          course={editingCourse}
          onClose={() => setEditingCourse(null)}
          onSave={handleEditSave}
          onDelete={handleEditDelete}
          teachers={teachers}
        />
      )}
    </div>
  );
};

export default Calendar;