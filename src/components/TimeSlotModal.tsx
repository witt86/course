import React, { useState, useMemo } from 'react';
import { X, Edit2, ChevronDown, ChevronUp, Users, Clock, Calendar, Loader } from 'lucide-react';
import { Course, Teacher } from '../types';
import { useQuery, useMutation } from '@apollo/client';
import { FILTER_COURSE_SCHEDULING } from '../graphql/queries';
import { DELETE_COURSE_SCHEDULING } from '../graphql/mutations';
import { addMinutes, formatTimeRange, formatDuration } from '../utils/date';
import EditCourseModal from './EditCourseModal';

interface TimeSlotModalProps {
  date: Date;
  courses: Course[];
  onClose: () => void;
  teachers: Teacher[];
  onCoursesUpdated: () => void;
  studyHouseCode: string;
}

const TimeSlotModal: React.FC<TimeSlotModalProps> = ({
  date,
  onClose,
  teachers,
  onCoursesUpdated,
  studyHouseCode,
}) => {
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const { data: timeRangeCourses, loading: coursesLoading, refetch: refetchCourses } = useQuery(FILTER_COURSE_SCHEDULING, {
    variables: {
      input: {
        startDate: date.toISOString(),
        endDate: addMinutes(date, 60).toISOString(),
        studyHouseCode,
        teacherUID: selectedTeacher ? parseInt(selectedTeacher) : undefined,
        studentUID: selectedStudent ? parseInt(selectedStudent) : undefined,
      },
    },
    fetchPolicy: 'network-only',
  });

  const [deleteCourseScheduling, { loading: isDeleting }] = useMutation(DELETE_COURSE_SCHEDULING);

  const allStudents = useMemo(() => {
    const studentMap = new Map();
    const courses = timeRangeCourses?.filterCourseScheduling || [];
    courses.forEach(course => {
      course.students?.forEach(student => {
        if (student.studentUID) {
          studentMap.set(student.studentUID, student);
        }
      });
    });
    return Array.from(studentMap.values());
  }, [timeRangeCourses]);

  const filteredCourses = useMemo(() => {
    return timeRangeCourses?.filterCourseScheduling || [];
  }, [timeRangeCourses]);

  const toggleExpand = (courseId: number) => {
    setExpandedCourse(expandedCourse === courseId.toString() ? null : courseId.toString());
  };

  const handleEditClick = (course: Course) => {
    setEditingCourse(course);
  };

  const handleSaveEdit = async () => {
    await refetchCourses();
    onCoursesUpdated();
    setEditingCourse(null);
  };

  const handleDeleteCourse = async (courseId: number) => {
    try {
      await deleteCourseScheduling({
        variables: {
          id: courseId,
        },
      });
      await refetchCourses();
      onCoursesUpdated();
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  return (
    <div className="tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-50 tw-flex tw-items-center tw-justify-center tw-z-50">
      <div className="tw-bg-white tw-rounded-xl tw-shadow-2xl tw-w-full tw-max-w-2xl tw-max-h-[80vh] tw-overflow-hidden tw-flex tw-flex-col">
        <div className="tw-bg-gradient-to-r tw-from-blue-500 tw-to-blue-600 tw-p-4 tw-flex tw-justify-between tw-items-center">
          <h2 className="tw-text-xl tw-font-bold tw-text-white">
            {date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })} {' '}
            {formatTimeRange(date, addMinutes(date, 60))} 的课程
            <span className="tw-ml-2 tw-text-sm tw-bg-blue-200 tw-px-2 tw-py-1 tw-rounded-full tw-text-blue-800">
              共{filteredCourses.length}条
            </span>
          </h2>
          <button
            onClick={onClose}
            className="tw-text-white hover:tw-text-gray-200 tw-transition-colors tw-duration-200"
          >
            <X size={24} />
          </button>
        </div>
        <div className="tw-bg-blue-100 tw-text-blue-800 tw-p-4 tw-border-b tw-border-blue-200">
          <div className="tw-flex tw-items-center tw-space-x-4">
            <div className="tw-flex tw-items-center tw-space-x-2 tw-flex-1">
              <label className="tw-text-sm tw-font-medium tw-text-blue-700 tw-whitespace-nowrap">按老师筛选：</label>
              <select
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="tw-form-select tw-block tw-w-full tw-pl-3 tw-pr-10 tw-py-2 tw-text-sm tw-bg-white tw-border tw-border-blue-300 tw-text-blue-800 tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-blue-400 tw-focus:border-blue-400 tw-rounded-md"
                disabled={coursesLoading}
              >
                <option value="">全部老师</option>
                {teachers.map((teacher) => (
                  <option key={teacher.teacherUID} value={teacher.teacherUID}>{teacher.teacherName}</option>
                ))}
              </select>
            </div>
            <div className="tw-flex tw-items-center tw-space-x-2 tw-flex-1">
              <label className="tw-text-sm tw-font-medium tw-text-blue-700 tw-whitespace-nowrap">按学生筛选：</label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="tw-form-select tw-block tw-w-full tw-pl-3 tw-pr-10 tw-py-2 tw-text-sm tw-bg-white tw-border tw-border-blue-300 tw-text-blue-800 tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-blue-400 tw-focus:border-blue-400 tw-rounded-md"
                disabled={coursesLoading}
              >
                <option value="">全部学生</option>
                {allStudents.map((student) => (
                  <option key={student.studentUID} value={student.studentUID}>{student.studentName}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="tw-flex-grow tw-overflow-y-auto tw-p-4 tw-space-y-3 tw-bg-gray-50">
          {coursesLoading ? (
            <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-h-48">
              <Loader size={32} className="tw-text-blue-500 tw-animate-spin tw-mb-4" />
              <p className="tw-text-gray-500">加载课程信息中...</p>
            </div>
          ) : filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <div
                key={course.ID}
                className="tw-bg-white tw-rounded-lg tw-shadow-md tw-transition-all tw-duration-300 tw-ease-in-out hover:tw-shadow-lg tw-border tw-border-gray-200 tw-overflow-hidden"
                style={{
                  borderLeft: `4px solid ${getCourseColor(course.teacher?.teacherName || '')}`,
                }}
              >
                <div 
                  className="tw-flex tw-flex-col tw-p-3 tw-cursor-pointer"
                  onClick={() => toggleExpand(course.ID)}
                >
                  <div className="tw-flex tw-justify-between tw-items-center">
                    <div className="tw-flex-grow tw-flex tw-items-center tw-space-x-4">
                      <h3 className="tw-font-semibold tw-text-base">{course.teacher?.teacherName}</h3>
                      <p className="tw-text-sm tw-text-gray-600">
                        {formatTimeRange(course.startTime, course.endTime)} ({formatDuration(course.duration)})
                      </p>
                      <div className="tw-flex tw-items-center tw-space-x-1">
                        <Users size={16} className="tw-text-gray-400" />
                        <p className="tw-text-sm tw-text-gray-500">
                          {course.students?.length || 0}人
                        </p>
                      </div>
                    </div>
                    <div className="tw-flex tw-items-center tw-space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(course);
                        }}
                        className="tw-text-blue-500 hover:tw-text-blue-700 tw-transition-colors tw-duration-200 tw-p-2 tw-rounded-full hover:tw-bg-blue-100"
                        disabled={isDeleting}
                      >
                        <Edit2 size={16} />
                      </button>
                      {expandedCourse === course.ID.toString() ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                  <div className="tw-mt-2 tw-text-sm tw-text-gray-600">
                    学生: {course.students?.slice(0, 3).map(s => s.studentName).join(', ')}
                    {(course.students?.length || 0) > 3 && (
                      <span className="tw-text-blue-500 tw-ml-1">
                        {expandedCourse === course.ID.toString() ? '' : `等${course.students?.length}人`}
                      </span>
                    )}
                  </div>
                </div>
                {expandedCourse === course.ID.toString() && (
                  <div className="tw-bg-gray-50 tw-p-3 tw-border-t tw-border-gray-200">
                    <p className="tw-text-sm tw-mb-2"><span className="tw-font-medium">开始时间:</span> {formatTimeRange(course.startTime, course.endTime)}</p>
                    <p className="tw-text-sm tw-mb-2"><span className="tw-font-medium">课程时长:</span> {formatDuration(course.duration)}</p>
                    <div className="tw-text-sm">
                      <span className="tw-font-medium">学生:</span>{' '}
                      {course.students?.map(s => s.studentName).join(', ')}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-h-48">
              <Calendar size={48} className="tw-text-gray-400 tw-mb-4" />
              <p className="tw-text-gray-500">当前时段暂无课程安排</p>
            </div>
          )}
        </div>
      </div>

      {editingCourse && (
        <EditCourseModal
          course={editingCourse}
          onClose={() => setEditingCourse(null)}
          onSave={handleSaveEdit}
          onDelete={handleDeleteCourse}
          teachers={teachers}
          studyHouseCode={studyHouseCode}
        />
      )}
    </div>
  );
};

const getCourseColor = (teacherName: string) => {
  const colors = [
    '#4299E1', '#48BB78', '#ED8936', '#ECC94B', '#9F7AEA',
    '#ED64A6', '#38B2AC', '#F56565', '#667EEA', '#ED64A6'
  ];
  const index = teacherName.charCodeAt(0) % colors.length;
  return colors[index];
};

export default TimeSlotModal;