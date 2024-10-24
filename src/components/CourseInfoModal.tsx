import React from 'react';
import { X, Clock, Calendar, Users, Edit, Trash2 } from 'lucide-react';
import { Course } from '../types';

interface CourseInfoModalProps {
  courses: Course[];
  onClose: () => void;
  filterType: 'teacher' | 'student';
  selectedItem: string;
}

const CourseInfoModal: React.FC<CourseInfoModalProps> = ({ courses, onClose, filterType, selectedItem }) => {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? `${hours}小时` : ''}${mins > 0 ? `${mins}分钟` : ''}`;
  };

  return (
    <div className="tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-50 tw-flex tw-items-center tw-justify-center tw-z-50">
      <div className="tw-bg-white tw-rounded-xl tw-shadow-2xl tw-w-full tw-max-w-2xl tw-max-h-[80vh] tw-overflow-hidden tw-flex tw-flex-col">
        <div className="tw-bg-gradient-to-r tw-from-blue-500 tw-to-blue-600 tw-p-4 tw-flex tw-justify-between tw-items-center">
          <h2 className="tw-text-xl tw-font-bold tw-text-white">
            {filterType === 'teacher' ? '老师' : '学生'}：{selectedItem} 的排课信息
          </h2>
          <button
            onClick={onClose}
            className="tw-text-white hover:tw-text-gray-200 tw-transition-colors tw-duration-200"
          >
            <X size={24} />
          </button>
        </div>
        <div className="tw-flex-grow tw-overflow-y-auto tw-p-4 tw-space-y-4 tw-custom-scrollbar">
          {courses.length > 0 ? (
            courses.map((course, index) => (
              <div
                key={index}
                className="tw-bg-white tw-rounded-lg tw-shadow-md tw-p-4 tw-border tw-border-gray-200 hover:tw-shadow-lg tw-transition-shadow tw-duration-200"
              >
                <div className="tw-flex tw-justify-between tw-items-start tw-mb-2">
                  <h3 className="tw-text-lg tw-font-semibold tw-text-blue-600">{course.teacher}</h3>
                  <div className="tw-flex tw-space-x-2">
                    <button className="tw-p-1 tw-rounded-full hover:tw-bg-blue-100 tw-transition-colors tw-duration-200">
                      <Edit size={18} className="tw-text-blue-500" />
                    </button>
                    <button className="tw-p-1 tw-rounded-full hover:tw-bg-red-100 tw-transition-colors tw-duration-200">
                      <Trash2 size={18} className="tw-text-red-500" />
                    </button>
                  </div>
                </div>
                <div className="tw-space-y-2">
                  <p className="tw-flex tw-items-center tw-text-gray-600">
                    <Users size={16} className="tw-mr-2" />
                    学生：{course.students.join(', ')}
                  </p>
                  <p className="tw-flex tw-items-center tw-text-gray-600">
                    <Clock size={16} className="tw-mr-2" />
                    课程时长：{formatDuration(course.duration)}
                  </p>
                  <p className="tw-flex tw-items-center tw-text-gray-600">
                    <Calendar size={16} className="tw-mr-2" />
                    开始时间：{new Date(course.startTime).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-h-full tw-text-gray-500">
              <Calendar size={48} className="tw-mb-4" />
              <p className="tw-text-xl tw-font-semibold">暂无排课信息</p>
              <p className="tw-mt-2">当前{filterType === 'teacher' ? '老师' : '学生'}还没有安排课程</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseInfoModal;