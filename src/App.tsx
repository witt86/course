import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import Calendar from './components/Calendar';
import NewCourseButton from './components/NewCourseButton';
import NewCourseModal from './components/NewCourseModal';
import DatePicker from './components/DatePicker';
import FilterModal from './components/FilterModal';
import CourseInfoModal from './components/CourseInfoModal';
import TimeSlotModal from './components/TimeSlotModal';
import { ViewType, Course } from './types';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';
import { FILTER_COURSE_SCHEDULING, FILTER_TEACHER_LIST } from './graphql/queries';
import { getDateRange, formatDateRange } from './utils/date';
import { getStudyHouseCode } from './utils/url';

const App: React.FC = () => {
  const [viewType, setViewType] = useState<ViewType>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showNewCourseModal, setShowNewCourseModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showCourseInfoModal, setShowCourseInfoModal] = useState(false);
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ date: Date; courses: Course[] } | null>(null);
  const [filter, setFilter] = useState<{ type: 'teacher' | 'student' | null; value: string | null }>({ type: null, value: null });
  const [filterDisplayName, setFilterDisplayName] = useState<string | null>(null);

  const studyHouseCode = getStudyHouseCode();
  const dateRange = getDateRange(currentDate, viewType);

  const { data: coursesData, loading: coursesLoading, refetch: refetchCourses } = useQuery(FILTER_COURSE_SCHEDULING, {
    variables: {
      input: {
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
        studyHouseCode,
        teacherUID: filter.type === 'teacher' ? parseInt(filter.value || '0') : undefined,
        studentUID: filter.type === 'student' ? parseInt(filter.value || '0') : undefined,
      },
    },
  });

  const { data: teachersData } = useQuery(FILTER_TEACHER_LIST, {
    variables: {
      input: {
        studyHouseCode,
      },
    },
  });

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
    setShowDatePicker(false);
  };

  const handleNavigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (viewType) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setCurrentDate(newDate);
  };

  const handleViewTypeChange = (type: ViewType) => {
    // 切换视图时重置为当前日期
    setCurrentDate(new Date());
    setViewType(type);
  };

  const handleTimeSlotClick = (date: Date, courses: Course[]) => {
    setSelectedTimeSlot({ date, courses });
    setShowTimeSlotModal(true);
  };

  const handleFilter = (type: 'teacher' | 'student', value: string, displayName: string) => {
    setFilter({ type, value });
    setFilterDisplayName(displayName);
    setShowFilterModal(false);
  };

  const handleClearFilter = () => {
    setFilter({ type: null, value: null });
    setFilterDisplayName(null);
  };

  const handleCoursesUpdated = () => {
    refetchCourses();
  };

  const currentDateRange = formatDateRange(dateRange.startDate, dateRange.endDate);

  return (
    <div className="tw-min-h-screen tw-bg-gradient-to-b tw-from-blue-50 tw-to-white tw-flex tw-flex-col">
      <header className="tw-bg-gradient-to-r tw-from-blue-500 tw-to-blue-600 tw-text-white tw-shadow-md tw-p-4 tw-flex tw-justify-between tw-items-center">
        <h1 className="tw-text-2xl tw-font-bold tw-flex tw-items-center">
          <CalendarIcon className="tw-mr-2" />
          {currentDateRange} 排课表
        </h1>
        <div className="tw-flex tw-items-center tw-space-x-4">
          <button 
            onClick={() => handleNavigateDate('prev')} 
            className="tw-p-1 hover:tw-bg-blue-600 tw-rounded"
          >
            <ChevronLeft size={24} />
          </button>
          <span className="tw-bg-blue-600 tw-text-white tw-font-bold tw-py-2 tw-px-4 tw-rounded">
            {currentDateRange}
          </span>
          <button 
            onClick={() => handleNavigateDate('next')} 
            className="tw-p-1 hover:tw-bg-blue-600 tw-rounded"
          >
            <ChevronRight size={24} />
          </button>
          <div className="tw-flex tw-space-x-2">
            {(['day', 'week', 'month'] as ViewType[]).map((type) => (
              <button
                key={type}
                onClick={() => handleViewTypeChange(type)}
                className={`tw-px-3 tw-py-1 tw-rounded ${
                  viewType === type ? 'tw-bg-blue-700' : 'tw-bg-blue-600 hover:tw-bg-blue-700'
                } tw-transition tw-duration-200`}
              >
                {type === 'day' ? '日' : type === 'week' ? '周' : '月'}
              </button>
            ))}
          </div>
          <div className="tw-flex tw-items-center tw-space-x-4">
            {filterDisplayName && (
              <div className="tw-flex tw-items-center tw-bg-blue-100 tw-text-blue-800 tw-px-3 tw-py-1 tw-rounded-full">
                <span className="tw-mr-2">
                  {filter.type === 'teacher' ? '老师' : '学生'}: {filterDisplayName}
                </span>
                <button
                  onClick={handleClearFilter}
                  className="tw-text-blue-600 hover:tw-text-blue-800"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            <button
              onClick={() => setShowFilterModal(true)}
              className="tw-bg-blue-600 hover:tw-bg-blue-700 tw-text-white tw-font-bold tw-py-2 tw-px-4 tw-rounded tw-transition tw-duration-200 tw-flex tw-items-center"
            >
              <Filter size={18} className="tw-mr-2" />
              筛选
            </button>
          </div>
        </div>
      </header>
      <main className="tw-flex-grow tw-overflow-hidden">
        <Calendar 
          viewType={viewType} 
          courses={coursesData?.filterCourseScheduling || []} 
          onDateChange={handleDateChange}
          currentDate={currentDate}
          filter={filter}
          teachers={teachersData?.filterTeacherList || []}
          onTimeSlotClick={handleTimeSlotClick}
          onCoursesUpdated={handleCoursesUpdated}
        />
      </main>
      
      <NewCourseButton onClick={() => setShowNewCourseModal(true)} />

      {showNewCourseModal && (
        <NewCourseModal
          onClose={() => setShowNewCourseModal(false)}
          onCoursesUpdated={handleCoursesUpdated}
          teachers={teachersData?.filterTeacherList || []}
          studyHouseCode={studyHouseCode}
        />
      )}
      
      {showDatePicker && (
        <DatePicker
          currentDate={currentDate}
          onDateSelect={handleDateChange}
          onClose={() => setShowDatePicker(false)}
        />
      )}
      
      {showFilterModal && (
        <FilterModal
          onClose={() => setShowFilterModal(false)}
          onFilter={handleFilter}
          studyHouseCode={studyHouseCode}
        />
      )}
      
      {showCourseInfoModal && filter.type && filter.value && (
        <CourseInfoModal
          courses={coursesData?.filterCourseScheduling || []}
          onClose={() => setShowCourseInfoModal(false)}
          filterType={filter.type}
          selectedItem={filter.value}
        />
      )}
      
      {showTimeSlotModal && selectedTimeSlot && (
        <TimeSlotModal
          date={selectedTimeSlot.date}
          courses={selectedTimeSlot.courses}
          onClose={() => setShowTimeSlotModal(false)}
          teachers={teachersData?.filterTeacherList || []}
          onCoursesUpdated={handleCoursesUpdated}
          studyHouseCode={studyHouseCode}
        />
      )}
    </div>
  );
};

export default App;