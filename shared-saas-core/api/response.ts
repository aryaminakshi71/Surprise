export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function createSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
  };
}

export function createErrorResponse(error: string): ApiResponse<null> {
  return {
    success: false,
    error,
  };
}

export function createPaginatedResponse<T>(
  items: T[],
  page: number,
  limit: number,
  total: number
): ApiResponse<PaginatedResponse<T>> {
  const totalPages = Math.ceil(total / limit);
  
  return {
    success: true,
    data: {
      items,
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

export function handleApiError(error: unknown): ApiResponse<null> {
  console.error('API Error:', error);
  
  if (error instanceof Error) {
    return createErrorResponse(error.message);
  }
  
  return createErrorResponse('An unexpected error occurred');
}

export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, String(v)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  
  return searchParams.toString();
}

export async function fetchApi<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return createErrorResponse(data.error || 'Request failed');
    }

    return createSuccessResponse(data.data || data);
  } catch (error) {
    return handleApiError(error);
  }
}
