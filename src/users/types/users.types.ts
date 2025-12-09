export type UserResponse = {
  id: number;
  name: string;
  email: string;
};

export type PaginatedUsers = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: UserResponse[];
};
