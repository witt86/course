import React, { useState, useEffect, useCallback } from 'react';
import { X, Search, User, Users, Loader } from 'lucide-react';
import { useQuery } from '@apollo/client';
import { FILTER_TEACHER_LIST } from '../graphql/queries';
import { Teacher, Student } from '../types';

interface FilterModalProps {
  onClose: () => void;
  onFilter: (type: 'teacher' | 'student', value: string, displayName: string) => void;
  studyHouseCode: string;
}

const FilterModal: React.FC<FilterModalProps> = ({ onClose, onFilter, studyHouseCode }) => {
  const [filterType, setFilterType] = useState<'teacher' | 'student'>('teacher');
  const [searchTerm, setSearchTerm] = useState('');
  const [allStudents, setAllStudents] = useState<Student[]>([]);

  // 获取所有老师数据
  const { data: teachersData, loading: teachersLoading } = useQuery(FILTER_TEACHER_LIST, {
    variables: {
      input: {
        studyHouseCode,
      },
    },
  });

  // 从老师数据中提取所有学生
  useEffect(() => {
    if (teachersData?.filterTeacherList) {
      const students = new Map<number, Student>();
      teachersData.filterTeacherList.forEach((teacher: Teacher) => {
        teacher.studyGroups?.forEach(group => {
          group.students.forEach(student => {
            if (!students.has(student.studentUID)) {
              students.set(student.studentUID, student);
            }
          });
        });
      });
      setAllStudents(Array.from(students.values()));
    }
  }, [teachersData]);

  const filteredItems = useCallback(() => {
    const searchTermLower = searchTerm.toLowerCase();
    if (filterType === 'teacher') {
      return teachersData?.filterTeacherList.filter((teacher: Teacher) =>
        teacher.teacherName?.toLowerCase().includes(searchTermLower) ||
        teacher.teacherUID?.toString().includes(searchTerm)
      ) || [];
    } else {
      return allStudents.filter(student =>
        student.studentName?.toLowerCase().includes(searchTermLower) ||
        student.studentUID?.toString().includes(searchTerm)
      );
    }
  }, [filterType, teachersData, allStudents, searchTerm]);

  const handleItemClick = (item: Teacher | Student) => {
    const displayName = 'teacherName' in item ? item.teacherName : item.studentName;
    const value = ('teacherUID' in item ? item.teacherUID : item.studentUID).toString();
    onFilter(filterType, value, displayName);
    onClose();
  };

  const isLoading = teachersLoading || (filterType === 'student' && allStudents.length === 0);

  return (
    <div className="tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-50 tw-flex tw-items-center tw-justify-center tw-z-50">
      <div className="tw-bg-white tw-rounded-xl tw-shadow-2xl tw-w-full tw-max-w-2xl tw-max-h-[70vh] tw-min-h-[40vh] tw-overflow-hidden tw-flex tw-flex-col md:tw-flex-row">
        {/* Left Panel */}
        <div className="tw-w-full md:tw-w-1/3 tw-bg-gradient-to-b tw-from-blue-50 tw-to-blue-100 tw-p-6 tw-border-r tw-border-blue-200">
          <h2 className="tw-text-2xl tw-font-bold tw-mb-6 tw-text-blue-800">筛选选项</h2>
          <div className="tw-space-y-4">
            <button
              className={`tw-w-full tw-text-left tw-px-4 tw-py-3 tw-rounded-lg tw-flex tw-items-center tw-justify-between tw-transition-all tw-duration-200 ${
                filterType === 'teacher'
                  ? 'tw-bg-blue-500 tw-text-white tw-shadow-md'
                  : 'tw-bg-white tw-text-blue-700 hover:tw-bg-blue-50'
              }`}
              onClick={() => {
                setFilterType('teacher');
                setSearchTerm('');
              }}
            >
              <span className="tw-flex tw-items-center">
                <User className="tw-mr-2" size={20} />
                按老师筛选
              </span>
            </button>
            <button
              className={`tw-w-full tw-text-left tw-px-4 tw-py-3 tw-rounded-lg tw-flex tw-items-center tw-justify-between tw-transition-all tw-duration-200 ${
                filterType === 'student'
                  ? 'tw-bg-blue-500 tw-text-white tw-shadow-md'
                  : 'tw-bg-white tw-text-blue-700 hover:tw-bg-blue-50'
              }`}
              onClick={() => {
                setFilterType('student');
                setSearchTerm('');
              }}
            >
              <span className="tw-flex tw-items-center">
                <Users className="tw-mr-2" size={20} />
                按学生筛选
              </span>
            </button>
          </div>
        </div>

        {/* Right Panel */}
        <div className="tw-w-full md:tw-w-2/3 tw-p-6 tw-flex tw-flex-col tw-bg-white tw-overflow-y-auto tw-custom-scrollbar">
          <div className="tw-flex tw-justify-between tw-items-center tw-mb-6">
            <h3 className="tw-text-xl tw-font-semibold tw-text-gray-800">
              {filterType === 'teacher' ? '选择老师' : '选择学生'}
            </h3>
            <button
              onClick={onClose}
              className="tw-text-gray-500 hover:tw-text-gray-700 tw-transition-colors tw-duration-200 tw-rounded-full tw-p-2 hover:tw-bg-gray-100"
            >
              <X size={24} />
            </button>
          </div>

          <div className="tw-relative tw-mb-4">
            <input
              type="text"
              placeholder={`搜索${filterType === 'teacher' ? '老师' : '学生'}姓名或ID`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="tw-w-full tw-pl-10 tw-pr-4 tw-py-2 tw-border tw-border-gray-300 tw-rounded-lg tw-shadow-sm focus:tw-ring-2 focus:tw-ring-blue-400 focus:tw-border-blue-400 tw-transition-all tw-duration-200"
            />
            <Search className="tw-absolute tw-left-3 tw-top-2.5 tw-text-gray-400" size={20} />
          </div>

          <div className="tw-flex-grow tw-overflow-y-auto tw-custom-scrollbar">
            {isLoading ? (
              <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-h-48">
                <Loader size={32} className="tw-text-blue-500 tw-animate-spin tw-mb-4" />
                <p className="tw-text-gray-500">加载中...</p>
              </div>
            ) : (
              <div className="tw-space-y-2">
                {filteredItems().map((item) => (
                  <button
                    key={filterType === 'teacher' ? item.teacherUID : item.studentUID}
                    onClick={() => handleItemClick(item)}
                    className="tw-w-full tw-text-left tw-px-4 tw-py-3 tw-rounded-lg tw-transition-all tw-duration-200 hover:tw-bg-blue-50"
                  >
                    <span className="tw-text-gray-700">
                      {filterType === 'teacher' ? item.teacherName : item.studentName}
                    </span>
                    <span className="tw-text-gray-500 tw-text-sm tw-ml-2">
                      (ID: {filterType === 'teacher' ? item.teacherUID : item.studentUID})
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;