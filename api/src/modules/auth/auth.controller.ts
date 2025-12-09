import httpStatus from 'http-status';

import * as emailService from '@/shared/services/email.service';
import * as tokenService from '@/shared/services/token.service';
import catchAsync from '@/shared/utils/catch-async';
import zParse from '@/shared/utils/z-parse';
import type { ApiResponse } from '@/types/response';

import type { UserWithRoles } from '../user/user.types';
import * as authService from './auth.service';
import * as authSchema from './auth.validation';

// ============================================================================
// AUTHENTICATION CONTROLLERS
// ============================================================================

export const register = catchAsync(
  async (req): Promise<ApiResponse<{ user: UserWithRoles; tokens: any }>> => {
    const { body } = await zParse(authSchema.registerSchema, req);

    const user = await authService.register(body);
    const tokens = await tokenService.generateAuthTokens(user);

    return {
      statusCode: httpStatus.CREATED,
      message: 'User registered successfully',
      data: { user, tokens },
    };
  }
);

export const login = catchAsync(
  async (req): Promise<ApiResponse<{ user: UserWithRoles; tokens: any }>> => {
    const {
      body: { email, password },
    } = await zParse(authSchema.loginSchema, req);

    const user = await authService.loginUserWithEmailAndPassword(email, password);
    const tokens = await tokenService.generateAuthTokens(user);

    return {
      statusCode: httpStatus.OK,
      message: 'User logged in successfully',
      data: { user, tokens },
    };
  }
);

export const logout = catchAsync(async (req): Promise<ApiResponse<void>> => {
  const {
    body: { refreshToken },
  } = await zParse(authSchema.logoutSchema, req);

  await authService.logout(refreshToken);

  return {
    statusCode: httpStatus.OK,
    message: 'User logged out successfully',
  };
});

export const refreshTokens = catchAsync(async (req): Promise<ApiResponse<any>> => {
  const {
    body: { refreshToken },
  } = await zParse(authSchema.refreshTokensSchema, req);

  const tokens = await authService.refreshAuth(refreshToken);

  return {
    statusCode: httpStatus.OK,
    message: 'Tokens refreshed successfully',
    data: tokens,
  };
});

// ============================================================================
// PASSWORD MANAGEMENT CONTROLLERS
// ============================================================================

export const forgotPassword = catchAsync(async (req): Promise<ApiResponse<void>> => {
  const {
    body: { email },
  } = await zParse(authSchema.forgotPasswordSchema, req);

  const resetPasswordToken = await tokenService.generateResetPasswordToken(email);
  await emailService.sendResetPasswordEmail(email, resetPasswordToken);

  return {
    statusCode: httpStatus.OK,
    message: 'Reset password email sent successfully',
  };
});

export const resetPassword = catchAsync(async (req): Promise<ApiResponse<void>> => {
  const {
    query: { token },
    body: { password },
  } = await zParse(authSchema.resetPasswordSchema, req);

  await authService.resetPassword(token as string, password);

  return {
    statusCode: httpStatus.OK,
    message: 'Password reset successfully',
  };
});
