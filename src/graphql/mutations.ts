import { gql } from '@apollo/client';

export const ADD_COURSE_SCHEDULING = gql`
  mutation AddCourseScheduling($input: CourseSchedulingInput!) {
    addCourseScheduling(input: $input) {
      ID
      studyHouseCode
      teacherUID
      startTime
      endTime
      duration
      description
      students {
        studentUID
        studentName
      }
      teacher {
        teacherUID
        teacherName
      }
    }
  }
`;

export const UPDATE_COURSE_SCHEDULING = gql`
  mutation UpdateCourseScheduling($input: CourseSchedulingInput!) {
    updateCourseScheduling(input: $input) {
      ID
      studyHouseCode
      teacherUID
      startTime
      endTime
      duration
      description
      students {
        studentUID
        studentName
      }
      teacher {
        teacherUID
        teacherName
      }
    }
  }
`;

export const DELETE_COURSE_SCHEDULING = gql`
  mutation DeleteCourseScheduling($id: Int!) {
    deleteCourseScheduling(id: $id) {
      ID
      studyHouseCode
      teacherUID
    }
  }
`;