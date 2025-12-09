import { User, UserRole } from '@prisma/client';

export interface TokenResponse {
  token: string;
  expires: Date;
}

export interface AuthTokensResponse {
  access: TokenResponse;
  refresh?: TokenResponse;
}

// Extend the User type to include relations
export interface ExtendedUser extends User {
  roles?: Array<UserRole & { role: { id: string; name: string } }>;
}

// API Response wrapper types with statusCode for catch-async
export interface ApiResponse<T = any> {
  statusCode?: number;
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T = any> {
  statusCode?: number;
  success?: boolean;
  data?: T[];
  meta?: PaginationMeta;
  message?: string;
}

// Error response type
export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  errors?: Record<string, string[]>; // For validation errors
  stack?: string; // Only in development
}

declare global {
  namespace Express {
    interface Request {
      user?: ExtendedUser;
    }
  }
}
