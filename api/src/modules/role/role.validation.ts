import { z } from 'zod';

export const createRoleSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, 'Role name is required')
      .max(50, 'Role name must be less than 50 characters')
      .regex(
        /^[a-zA-Z0-9_-\s]+$/,
        'Role name can only contain letters, numbers, hyphens, underscores, and spaces'
      ),
    description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  }),
});

export const updateRoleSchema = z.object({
  params: z.object({
    id: z.string().transform((val) => parseInt(val, 10)),
  }),
  body: z.object({
    name: z
      .string()
      .min(1, 'Role name is required')
      .max(50, 'Role name must be less than 50 characters')
      .regex(
        /^[a-zA-Z0-9_-\s]+$/,
        'Role name can only contain letters, numbers, hyphens, underscores, and spaces'
      )
      .optional(),
    description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  }),
});

export const getRoleSchema = z.object({
  params: z.object({
    id: z.string().transform((val) => parseInt(val, 10)),
  }),
});

export const deleteRoleSchema = z.object({
  params: z.object({
    id: z.string().transform((val) => parseInt(val, 10)),
  }),
});
