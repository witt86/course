import React from 'react';
import { Plus } from 'lucide-react';

interface NewCourseButtonProps {
  onClick: () => void;
}

const NewCourseButton: React.FC<NewCourseButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="tw-fixed tw-bottom-8 tw-right-8 tw-bg-gradient-to-r tw-from-blue-500 tw-to-blue-600 tw-text-white tw-rounded-full tw-p-4 tw-shadow-lg hover:tw-shadow-xl tw-transition-all tw-duration-200 tw-transform hover:tw-scale-110 tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-blue-400 tw-focus:ring-opacity-50 tw-flex tw-items-center tw-z-50"
    >
      <Plus size={24} className="tw-mr-2" />
      <span className="tw-font-semibold">新增排课</span>
    </button>
  );
};

export default NewCourseButton;