import { PrismaClient } from '@prisma/client';

import type { CreateRoleData, UpdateRoleData, RoleWithUserCount } from './role.types';

export class RoleRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(): Promise<RoleWithUserCount[]> {
    return this.prisma.role.findMany({
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findById(id: number): Promise<RoleWithUserCount | null> {
    return this.prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });
  }

  async findByName(name: string) {
    return this.prisma.role.findUnique({
      where: { name },
    });
  }

  async create(data: CreateRoleData) {
    return this.prisma.role.create({
      data,
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });
  }

  async update(id: number, data: UpdateRoleData) {
    return this.prisma.role.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });
  }

  async delete(id: number) {
    return this.prisma.role.delete({
      where: { id },
    });
  }

  async getUserCount(id: number): Promise<number> {
    const count = await this.prisma.userRole.count({
      where: { roleId: id },
    });
    return count;
  }
}
