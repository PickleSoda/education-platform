interface APIResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta?: any;
  errors?: unknown;
}

export function formatResponse<T>(
  statusCode: number,
  message: string,
  data?: T,
  errors?: Array<{
    path: string;
    message: string;
  }>,
  meta?: any
): APIResponse<T> {
  const response: APIResponse<T> = {
    success: statusCode >= 200 && statusCode < 300,
    statusCode,
    message,
    data,
    errors,
  };
  
  if (meta) {
    response.meta = meta;
  }
  
  return response;
}
