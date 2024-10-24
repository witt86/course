import React, { useState } from 'react';
import { X, User, Users, Clock, AlertCircle, Loader } from 'lucide-react';
import { Course, Teacher, Student } from '../types';
import { useMutation } from '@apollo/client';
import { UPDATE_COURSE_SCHEDULING, DELETE_COURSE_SCHEDULING } from '../graphql/mutations';
import DateTimePicker from './DateTimePicker';
import StudentSelectionModal from './StudentSelectionModal';

interface EditCourseModalProps {
  course: Course;
  onClose: () => void;
  onSave: () => void;
  onDelete: (courseId: number) => void;
  teachers: Teacher[];
  studyHouseCode: string;
}

interface FormErrors {
  teacher?: string;
  students?: string;
  startTime?: string;
  duration?: string;
}

const EditCourseModal: React.FC<EditCourseModalProps> = ({
  course,
  onClose,
  onSave,
  onDelete,
  teachers,
  studyHouseCode,
}) => {
  const [formData, setFormData] = useState({
    selectedTeacher: course.teacherUID,
    selectedStudents: course.students,
    duration: course.duration,
    startTime: new Date(course.startTime),
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);

  const [updateCourseScheduling, { loading: isUpdating }] = useMutation(UPDATE_COURSE_SCHEDULING);
  const [deleteCourseScheduling, { loading: isDeleting }] = useMutation(DELETE_COURSE_SCHEDULING);

  const isSubmitting = isUpdating || isDeleting;

  const selectedTeacherData = teachers.find(
    t => t.teacherUID.toString() === formData.selectedTeacher
  );

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.selectedTeacher) {
      newErrors.teacher = '请选择老师';
    }

    if (formData.selectedStudents.length === 0) {
      newErrors.students = '请至少选择一名学生';
    }

    if (!formData.startTime) {
      newErrors.startTime = '请选择课程开始时间';
    }

    if (formData.duration < 30) {
      newErrors.duration = '课程时长不能少于30分钟';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || isSubmitting) {
      return;
    }

    const endTime = new Date(formData.startTime.getTime() + formData.duration * 60000);

    try {
      await updateCourseScheduling({
        variables: {
          input: {
            ID: course.ID,
            studyHouseCode,
            teacherUID: parseInt(formData.selectedTeacher),
            startTime: formData.startTime.toISOString(),
            endTime: endTime.toISOString(),
            duration: formData.duration,
            students: formData.selectedStudents.map(student => ({ studentUID: student.studentUID })),
          },
        },
      });

      onSave();
      onClose();
    } catch (error) {
      console.error('Error updating course:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (isSubmitting) return;

    try {
      await deleteCourseScheduling({
        variables: {
          id: course.ID,
        },
      });
      onDelete(course.ID);
      onClose();
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  const handleStudentsSelected = (students: Student[]) => {
    setFormData(prev => ({ ...prev, selectedStudents: students }));
    setShowStudentModal(false);
    setErrors({ ...errors, students: undefined });
  };

  return (
    <div className="tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-50 tw-flex tw-items-center tw-justify-center tw-z-50">
      <div className="tw-bg-gradient-to-br tw-from-blue-50 tw-to-white tw-rounded-xl tw-shadow-xl tw-w-[600px] tw-max-h-[90vh] tw-overflow-y-auto">
        <div className="tw-flex tw-justify-between tw-items-center tw-px-6 tw-py-4 tw-border-b tw-border-gray-200">
          <h2 className="tw-text-xl tw-font-bold tw-text-gray-800">编辑课程</h2>
          <button
            onClick={onClose}
            className="tw-text-gray-500 hover:tw-text-gray-700 tw-transition-colors tw-duration-200"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="tw-p-6 tw-space-y-4">
          <div className="tw-space-y-1">
            <label className="tw-text-sm tw-font-medium tw-text-gray-700 tw-flex tw-items-center">
              <User size={16} className="tw-mr-2" />
              选择老师
            </label>
            <select
              value={formData.selectedTeacher}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, selectedTeacher: e.target.value }));
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
                disabled={!formData.selectedTeacher || isSubmitting}
                className={`tw-px-3 tw-py-1.5 tw-text-sm tw-bg-blue-500 tw-text-white tw-rounded-md hover:tw-bg-blue-600 tw-transition-colors ${
                  (!formData.selectedTeacher || isSubmitting) ? 'tw-opacity-50 tw-cursor-not-allowed' : ''
                }`}
              >
                添加学生
              </button>
            </div>
            <div className={`tw-border tw-rounded-lg tw-p-3 tw-min-h-[80px] ${
              errors.students ? 'tw-border-red-500' : 'tw-border-gray-300'
            }`}>
              {formData.selectedStudents.length > 0 ? (
                <div className="tw-flex tw-flex-wrap tw-gap-2">
                  {formData.selectedStudents.map((student) => (
                    <div
                      key={student.studentUID}
                      className="tw-bg-blue-50 tw-text-blue-700 tw-px-2 tw-py-1 tw-rounded tw-text-sm tw-flex tw-items-center"
                    >
                      <span>{student.studentName}</span>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          selectedStudents: prev.selectedStudents.filter(s => s.studentUID !== student.studentUID)
                        }))}
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
              课程开始时间
            </label>
            <DateTimePicker
              value={formData.startTime}
              onChange={(date) => setFormData(prev => ({ ...prev, startTime: date }))}
              minTime="07:00"
              maxTime="22:00"
            />
            {errors.startTime && (
              <p className="tw-text-red-500 tw-text-xs">{errors.startTime}</p>
            )}
          </div>

          <div className="tw-space-y-1">
            <label className="tw-text-sm tw-font-medium tw-text-gray-700 tw-flex tw-items-center">
              <Clock size={16} className="tw-mr-2" />
              课程时长（分钟）
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }));
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

          <div className="tw-flex tw-items-center tw-justify-between tw-pt-4 tw-mt-2 tw-border-t tw-border-gray-200">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isSubmitting}
              className={`tw-px-4 tw-py-2 tw-bg-red-500 tw-text-white hover:tw-bg-red-600 tw-rounded-lg tw-flex tw-items-center ${
                isSubmitting ? 'tw-opacity-50 tw-cursor-not-allowed' : ''
              }`}
            >
              {isDeleting && <Loader size={16} className="tw-mr-2 tw-animate-spin" />}
              {isDeleting ? '删除中...' : '删除课程'}
            </button>
            <div className="tw-flex tw-items-center tw-space-x-3">
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
                type="submit"
                disabled={isSubmitting}
                className={`tw-px-4 tw-py-2 tw-bg-blue-500 tw-text-white hover:tw-bg-blue-600 tw-rounded-lg tw-flex tw-items-center ${
                  isSubmitting ? 'tw-opacity-50 tw-cursor-not-allowed' : ''
                }`}
              >
                {isUpdating && <Loader size={16} className="tw-mr-2 tw-animate-spin" />}
                {isUpdating ? '保存中...' : '保存修改'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {showDeleteConfirm && (
        <div className="tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-50 tw-flex tw-items-center tw-justify-center tw-z-50">
          <div className="tw-bg-white tw-rounded-xl tw-p-6 tw-max-w-sm tw-w-full">
            <div className="tw-flex tw-items-center tw-mb-4">
              <AlertCircle size={24} className="tw-text-red-500 tw-mr-2" />
              <h3 className="tw-text-lg tw-font-semibold">确认删除</h3>
            </div>
            <p className="tw-mb-4">您确定要删除这条排课信息吗？此操作不可撤销。</p>
            <div className="tw-flex tw-justify-end tw-space-x-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isSubmitting}
                className="tw-px-4 tw-py-2 tw-bg-gray-100 tw-text-gray-700 hover:tw-bg-gray-200 tw-rounded-lg"
              >
                取消
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
                className={`tw-px-4 tw-py-2 tw-bg-red-500 tw-text-white hover:tw-bg-red-600 tw-rounded-lg tw-flex tw-items-center ${
                  isSubmitting ? 'tw-opacity-50 tw-cursor-not-allowed' : ''
                }`}
              >
                {isDeleting && <Loader size={16} className="tw-mr-2 tw-animate-spin" />}
                {isDeleting ? '删除中...' : '确认删除'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showStudentModal && selectedTeacherData && (
        <StudentSelectionModal
          teacher={selectedTeacherData}
          selectedStudents={formData.selectedStudents}
          onConfirm={handleStudentsSelected}
          onClose={() => setShowStudentModal(false)}
        />
      )}
    </div>
  );
};

export default EditCourseModal;