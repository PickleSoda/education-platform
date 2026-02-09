import httpStatus from 'http-status';
import { PrismaClient } from '@prisma/client';

import ApiError from '@/shared/utils/api-error';
import prisma from '@/client';

import { RoleRepository } from './role.repository';
import type { CreateRoleData, UpdateRoleData } from './role.types';

class RoleService {
  private roleRepository: RoleRepository;

  constructor(prismaClient: PrismaClient) {
    this.roleRepository = new RoleRepository(prismaClient);
  }

  async getAllRoles() {
    return this.roleRepository.findAll();
  }

  async getRoleById(id: number) {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
    }
    return role;
  }

  async createRole(data: CreateRoleData) {
    // Check if role name already exists
    const existingRole = await this.roleRepository.findByName(data.name);
    if (existingRole) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Role name already exists');
    }

    return this.roleRepository.create(data);
  }

  async updateRole(id: number, data: UpdateRoleData) {
    // Check if role exists
    const existingRole = await this.roleRepository.findById(id);
    if (!existingRole) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
    }

    // Check if new name already exists (if name is being updated)
    if (data.name && data.name !== existingRole.name) {
      const roleWithSameName = await this.roleRepository.findByName(data.name);
      if (roleWithSameName && roleWithSameName.id !== id) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Role name already exists');
      }
    }

    return this.roleRepository.update(id, data);
  }

  async deleteRole(id: number) {
    // Check if role exists
    const existingRole = await this.roleRepository.findById(id);
    if (!existingRole) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
    }

    // Protect core system roles from deletion
    const protectedRoles = ['student', 'teacher', 'admin'];
    if (protectedRoles.includes(existingRole.name.toLowerCase())) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Cannot delete protected role '${existingRole.name}'. This is a core system role.`
      );
    }

    // Check if role has assigned users
    const userCount = await this.roleRepository.getUserCount(id);
    if (userCount > 0) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Cannot delete role. ${userCount} users are assigned to this role.`
      );
    }

    await this.roleRepository.delete(id);
    return { message: 'Role deleted successfully' };
  }
}

export const roleService = new RoleService(prisma);
