export type PaginationCourse = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
  data: CourseProps[];
};

export type CourseProps = {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  status: string;
  teacherId: number;
};

export type CreateCourseResponse = {
  message: string;
  newCourse: CourseProps;
};

export type UpdateCourseResponse = {
  message: string;
  updatedCourse: CourseProps;
};

export type DeleteCourseResponse = {
  message: string;
};

export type CourseDetailResponse = {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  status: string;
  teacher: {
    id: number;
    name: string;
  };
  modules: {
    id: number;
    title: string;
    position: number;
  }[];
};

export type PublishCourseResponse = {
  message: string;
  updatedCourse: CourseProps;
};
