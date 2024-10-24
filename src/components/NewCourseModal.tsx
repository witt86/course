import React, { useState } from 'react';
import { X, User, Users, Clock, Plus, Minus, Loader, CheckCircle } from 'lucide-react';
import { Course, Teacher, Student } from '../types';
import { useMutation } from '@apollo/client';
import { ADD_COURSE_SCHEDULING } from '../graphql/mutations';
import StudentSelectionModal from './StudentSelectionModal';
import DateTimePicker from './DateTimePicker';

interface NewCourseModalProps {
  onClose: () => void;
  onCoursesUpdated: () => void;
  teachers: Teacher[];
  studyHouseCode: string;
}

interface FormErrors {
  teacher?: string;
  students?: string;
  startTimes?: string;
  duration?: string;
}

const NewCourseModal: React.FC<NewCourseModalProps> = ({
  onClose,
  onCoursesUpdated,
  teachers,
  studyHouseCode,
}) => {
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [duration, setDuration] = useState(60);
  const [startTimes, setStartTimes] = useState<Date[]>([new Date()]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [addCourseScheduling, { loading: isSubmitting }] = useMutation(ADD_COURSE_SCHEDULING);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!selectedTeacher) newErrors.teacher = '请选择老师';
    if (selectedStudents.length === 0) newErrors.students = '请至少选择一名学生';
    if (startTimes.length === 0) newErrors.startTimes = '请至少选择一个开始时间';
    if (duration < 30) newErrors.duration = '课程时长不能少于30分钟';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    try {
      for (const startTime of startTimes) {
        const endTime = new Date(startTime.getTime() + duration * 60000);
        await addCourseScheduling({
          variables: {
            input: {
              studyHouseCode,
              teacherUID: parseInt(selectedTeacher),
              startTime: startTime.toISOString(),
              endTime: endTime.toISOString(),
              duration,
              students: selectedStudents.map(student => ({ studentUID: student.studentUID })),
            },
          },
        });
      }
      setShowSuccess(true);
      onCoursesUpdated();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error adding courses:', error);
    }
  };

  const handleStartTimeChange = (index: number, value: Date) => {
    const newStartTimes = [...startTimes];
    newStartTimes[index] = value;
    setStartTimes(newStartTimes);
    setErrors({ ...errors, startTimes: undefined });
  };

  const addStartTime = () => {
    try {
      setStartTimes([...startTimes, new Date()]);
    } catch (error) {
      console.log(error);
    }
  };

  const removeStartTime = (index: number) => {
    setStartTimes(startTimes.filter((_, i) => i !== index));
  };

  return (
    <div className="tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-50 tw-flex tw-items-center tw-justify-center tw-z-50">
      <div className="tw-bg-gradient-to-br tw-from-blue-50 tw-to-white tw-rounded-xl tw-shadow-xl tw-w-[600px] tw-max-h-[90vh] tw-overflow-y-auto tw-relative">
        {showSuccess && (
          <div className="tw-absolute tw-inset-0 tw-bg-white tw-bg-opacity-90 tw-flex tw-items-center tw-justify-center tw-z-50">
            <div className="tw-flex tw-flex-col tw-items-center tw-space-y-4">
              <CheckCircle size={48} className="tw-text-green-500" />
              <p className="tw-text-lg tw-font-semibold tw-text-green-600">排课保存成功！</p>
            </div>
          </div>
        )}
        
        <div className="tw-flex tw-justify-between tw-items-center tw-px-6 tw-py-4 tw-border-b tw-border-gray-200">
          <h2 className="tw-text-xl tw-font-bold tw-text-gray-800">新增排课</h2>
          <button
            onClick={onClose}
            className="tw-text-gray-500 hover:tw-text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <form className="tw-p-6 tw-space-y-4">
          <div className="tw-space-y-1">
            <label className="tw-text-sm tw-font-medium tw-text-gray-700 tw-flex tw-items-center">
              <User size={16} className="tw-mr-2" />
              选择老师
            </label>
            <select
              value={selectedTeacher}
              onChange={(e) => {
                setSelectedTeacher(e.target.value);
                setErrors({ ...errors, teacher: undefined });
              }}
              className={`tw-w-full tw-p-2 tw-border tw-rounded-lg tw-shadow-sm ${
                errors.teacher ? 'tw-border-red-500' : 'tw-border-gray-300'
              }`}
              disabled={isSubmitting}
            >
              <option value="">选择老师</option>
              {teachers.map((teacher) => (
                <option key={teacher.teacherUID} value={teacher.teacherUID}>
                  {teacher.teacherName}
                </option>
              ))}
            </select>
            {errors.teacher && (
              <p className="tw-text-red-500 tw-text-xs">{errors.teacher}</p>
            )}
          </div>

          <div className="tw-space-y-1">
            <div className="tw-flex tw-justify-between tw-items-center">
              <label className="tw-text-sm tw-font-medium tw-text-gray-700 tw-flex tw-items-center">
                <Users size={16} className="tw-mr-2" />
                学生列表
              </label>
              <button
                type="button"
                onClick={() => setShowStudentModal(true)}
                disabled={!selectedTeacher || isSubmitting}
                className={`tw-px-3 tw-py-1.5 tw-text-sm tw-bg-blue-500 tw-text-white tw-rounded-md hover:tw-bg-blue-600 tw-transition-colors ${
                  (!selectedTeacher || isSubmitting) ? 'tw-opacity-50 tw-cursor-not-allowed' : ''
                }`}
              >
                添加学生
              </button>
            </div>
            <div className={`tw-border tw-rounded-lg tw-p-3 tw-min-h-[80px] ${
              errors.students ? 'tw-border-red-500' : 'tw-border-gray-300'
            }`}>
              {selectedStudents.length > 0 ? (
                <div className="tw-flex tw-flex-wrap tw-gap-2">
                  {selectedStudents.map((student) => (
                    <div
                      key={student.studentUID}
                      className="tw-bg-blue-50 tw-text-blue-700 tw-px-2 tw-py-1 tw-rounded tw-text-sm tw-flex tw-items-center"
                    >
                      <span>{student.studentName}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedStudents(selectedStudents.filter(s => s.studentUID !== student.studentUID))}
                        className="tw-text-red-500 hover:tw-text-red-700 tw-ml-2"
                        disabled={isSubmitting}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="tw-text-gray-500 tw-text-center tw-py-4">暂无学生，请点击添加学生按钮选择</p>
              )}
            </div>
            {errors.students && (
              <p className="tw-text-red-500 tw-text-xs">{errors.students}</p>
            )}
          </div>

          <div className="tw-space-y-1">
            <label className="tw-text-sm tw-font-medium tw-text-gray-700 tw-flex tw-items-center">
              <Clock size={16} className="tw-mr-2" />
              课程时长（分钟）
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => {
                setDuration(parseInt(e.target.value));
                setErrors({ ...errors, duration: undefined });
              }}
              min="30"
              step="30"
              className={`tw-w-full tw-p-2 tw-border tw-rounded-lg tw-shadow-sm ${
                errors.duration ? 'tw-border-red-500' : 'tw-border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.duration && (
              <p className="tw-text-red-500 tw-text-xs">{errors.duration}</p>
            )}
          </div>

          <div className="tw-space-y-1">
            <div className="tw-flex tw-justify-between tw-items-center">
              <label className="tw-text-sm tw-font-medium tw-text-gray-700">开始时间</label>
              <button
                type="button"
                onClick={addStartTime}
                className="tw-px-3 tw-py-1.5 tw-text-sm tw-bg-green-500 tw-text-white tw-rounded-md hover:tw-bg-green-600 tw-transition-colors"
                disabled={isSubmitting}
              >
                <Plus size={14} className="tw-inline tw-mr-1" />
                添加开始时间
              </button>
            </div>
            <div className="tw-space-y-2">
              {startTimes.map((startTime, index) => (
                <div key={index} className="tw-flex tw-items-center tw-gap-2">
                  <div className="tw-flex-grow">
                    <DateTimePicker
                      value={startTime}
                      onChange={(date) => handleStartTimeChange(index, date)}
                      minTime="07:00"
                      maxTime="22:00"
                    />
                  </div>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeStartTime(index)}
                      className="tw-p-1.5 tw-bg-red-500 tw-text-white tw-rounded-lg hover:tw-bg-red-600"
                      disabled={isSubmitting}
                    >
                      <Minus size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {errors.startTimes && (
              <p className="tw-text-red-500 tw-text-xs">{errors.startTimes}</p>
            )}
          </div>

          <div className="tw-flex tw-justify-end tw-space-x-3 tw-pt-4 tw-border-t tw-border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className={`tw-px-4 tw-py-2 tw-text-gray-700 tw-bg-gray-100 hover:tw-bg-gray-200 tw-rounded-lg ${
                isSubmitting ? 'tw-opacity-50 tw-cursor-not-allowed' : ''
              }`}
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`tw-px-4 tw-py-2 tw-bg-blue-500 tw-text-white hover:tw-bg-blue-600 tw-rounded-lg tw-flex tw-items-center ${
                isSubmitting ? 'tw-opacity-50 tw-cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting && <Loader size={16} className="tw-mr-2 tw-animate-spin" />}
              {isSubmitting ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>

      {showStudentModal && selectedTeacher && (
        <StudentSelectionModal
          teacher={teachers.find(t => t.teacherUID.toString() === selectedTeacher)!}
          selectedStudents={selectedStudents}
          onConfirm={(students) => {
            setSelectedStudents(students);
            setShowStudentModal(false);
            setErrors({ ...errors, students: undefined });
          }}
          onClose={() => setShowStudentModal(false)}
        />
      )}
    </div>
  );
};

export default NewCourseModal;