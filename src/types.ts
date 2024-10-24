export type ViewType = 'day' | 'week' | 'month';

export interface Course {
  ID: number;
  studyHouseCode: string;
  teacherUID: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  description?: string;
  students: Student[];
  teacher?: Teacher;
}

export interface Student {
  studentUID: number;
  studentName: string;
}

export interface Teacher {
  teacherUID: number;
  teacherName: string;
  studyGroups: StudyGroup[];
}

export interface StudyGroup {
  studyGroupUID: number;
  studyGroupName: string;
  students: Student[];
}