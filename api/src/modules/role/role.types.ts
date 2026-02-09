import type { Role } from '@prisma/client';

export type RoleWithUserCount = Role & {
  _count: {
    users: number;
  };
};

export type CreateRoleData = {
  name: string;
  description?: string;
};

export type UpdateRoleData = {
  name?: string;
  description?: string;
};
