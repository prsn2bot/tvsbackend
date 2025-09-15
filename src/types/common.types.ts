// Generic structure for a paginated API response
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

// Generic structure for a single-item API response
export interface ApiResponse<T> {
  data: T;
}
