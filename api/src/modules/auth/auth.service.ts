import { TokenType } from '@prisma/client';
import httpStatus from 'http-status';

import * as userService from '@/modules/user/user.service';
import type { UserWithRoles } from '@/modules/user/user.types';
import * as tokenService from '@/shared/services/token.service';
import ApiError from '@/shared/utils/api-error';
import { isPasswordMatch } from '@/shared/utils/encryption';
import { AuthTokensResponse } from '@/types/response';
import { authRepository } from './auth.repository';
import type { RegisterInput } from './auth.validation';

// ============================================================================
// AUTHENTICATION
// ============================================================================

export const register = async (data: RegisterInput): Promise<UserWithRoles> => {
  // Create user with the specified role (student or teacher)
  const user = await userService.createUser(data);

  return user;
};

export const loginUserWithEmailAndPassword = async (
  email: string,
  password: string
): Promise<UserWithRoles> => {
  const user = await userService.getUserByEmail(email);

  if (!user || !(await isPasswordMatch(password, user.passwordHash))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }

  if (!user.isActive) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Account is deactivated');
  }

  return user;
};

export const logout = async (refreshToken: string): Promise<void> => {
  const refreshTokenDoc = await authRepository.findValidToken(refreshToken, TokenType.REFRESH);
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Refresh token not found');
  }
  await authRepository.deleteToken(refreshTokenDoc.id);
};

export const refreshAuth = async (refreshToken: string): Promise<AuthTokensResponse> => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, TokenType.REFRESH);
    const user = await userService.getUserById(refreshTokenDoc.userId);
    if (!user) {
      throw new Error('User not found');
    }
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }
    await authRepository.deleteToken(refreshTokenDoc.id);
    const tokens = await tokenService.generateAuthTokens(user);
    return tokens;
  } catch (_error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

// ============================================================================
// PASSWORD MANAGEMENT
// ============================================================================

export const resetPassword = async (
  resetPasswordToken: string,
  newPassword: string
): Promise<void> => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(
      resetPasswordToken,
      TokenType.RESET_PASSWORD
    );
    const user = await userService.getUserById(resetPasswordTokenDoc.userId);
    if (!user) {
      throw new Error('User not found');
    }
    await userService.updateUser(user.id, { password: newPassword });
    await authRepository.deleteTokensByUserIdAndType(user.id, TokenType.RESET_PASSWORD);
  } catch (_error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
  }
};
