import React, { useState } from 'react';
import { X, Search, Check } from 'lucide-react';
import { Teacher, Student } from '../types';

interface StudentSelectionModalProps {
  teacher: Teacher;
  selectedStudents: Student[];
  onConfirm: (students: Student[]) => void;
  onClose: () => void;
}

const StudentSelectionModal: React.FC<StudentSelectionModalProps> = ({
  teacher,
  selectedStudents,
  onConfirm,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tempSelectedStudents, setTempSelectedStudents] = useState<Student[]>(selectedStudents);

  const handleStudentToggle = (student: Student) => {
    const isSelected = tempSelectedStudents.some(s => s.studentUID === student.studentUID);
    if (isSelected) {
      setTempSelectedStudents(tempSelectedStudents.filter(s => s.studentUID !== student.studentUID));
    } else {
      setTempSelectedStudents([...tempSelectedStudents, student]);
    }
  };

  const filteredGroups = teacher.studyGroups.map(group => ({
    ...group,
    students: group.students.filter(student =>
      student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentUID.toString().includes(searchTerm)
    ),
  })).filter(group => group.students.length > 0);

  return (
    <div className="tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-50 tw-flex tw-items-center tw-justify-center tw-z-[60]">
      <div className="tw-bg-white tw-rounded-xl tw-p-6 tw-max-w-2xl tw-w-full tw-max-h-[80vh] tw-flex tw-flex-col">
        <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
          <h2 className="tw-text-xl tw-font-bold">选择学生</h2>
          <button
            onClick={onClose}
            className="tw-text-gray-500 hover:tw-text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="tw-relative tw-mb-4">
          <input
            type="text"
            placeholder="搜索学生姓名或ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="tw-w-full tw-pl-10 tw-pr-4 tw-py-2 tw-border tw-border-gray-300 tw-rounded-lg"
          />
          <Search className="tw-absolute tw-left-3 tw-top-2.5 tw-text-gray-400" size={20} />
        </div>

        <div className="tw-flex-grow tw-overflow-y-auto tw-mb-4">
          {filteredGroups.map((group) => (
            <div key={group.studyGroupUID} className="tw-mb-4">
              <h3 className="tw-font-medium tw-mb-2">{group.studyGroupName}</h3>
              <div className="tw-space-y-1">
                {group.students.map((student) => {
                  const isSelected = tempSelectedStudents.some(
                    s => s.studentUID === student.studentUID
                  );
                  return (
                    <button
                      key={student.studentUID}
                      onClick={() => handleStudentToggle(student)}
                      className={`tw-w-full tw-flex tw-items-center tw-justify-between tw-px-3 tw-py-2 tw-rounded-lg tw-transition-colors ${
                        isSelected
                          ? 'tw-bg-blue-50 tw-text-blue-600'
                          : 'hover:tw-bg-gray-50'
                      }`}
                    >
                      <span>{student.studentName}</span>
                      {isSelected && <Check size={16} />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="tw-flex tw-justify-end tw-space-x-4">
          <button
            onClick={onClose}
            className="tw-px-4 tw-py-2 tw-text-gray-700 tw-bg-gray-100 hover:tw-bg-gray-200 tw-rounded-lg"
          >
            取消
          </button>
          <button
            onClick={() => onConfirm(tempSelectedStudents)}
            className="tw-px-4 tw-py-2 tw-bg-blue-500 tw-text-white hover:tw-bg-blue-600 tw-rounded-lg"
          >
            确认 ({tempSelectedStudents.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentSelectionModal;