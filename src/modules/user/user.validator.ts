import { z } from 'zod';

export const userRoleSchema = z.enum(['admin', 'client']);


export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const createUserSchema = z.object({
  email: z.string().email('Invalid email format').max(255, 'Email too long'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: userRoleSchema,
  erpDomain: z.string().min(1, 'ERP domain is required').optional(),
  apiKey: z.string().min(1, 'API key is required').optional(),
  apiSecret: z.string().min(1, 'API secret is required').optional(),
}).refine((data) => {
  if (data.role === 'client') {
    return data.erpDomain && data.apiKey && data.apiSecret;
  }
  return true;
}, {
  message: 'ERP domain, API key, and API secret are required for client role',
  path: ['erpDomain'],
});

export const editUserSchema = z.object({
  email: z.string().email('Invalid email format').max(255, 'Email too long').optional().transform(val => val === "" ? undefined : val),
  password: z.string().min(8, 'Password must be at least 8 characters').optional().transform(val => val === "" ? undefined : val),
  role: userRoleSchema.optional(),
  erpDomain: z.string().min(1, 'ERP domain cannot be empty').optional().transform(val => val === "" ? undefined : val),
  apiKey: z.string().min(1, 'API key cannot be empty').optional().transform(val => val === "" ? undefined : val),
  apiSecret: z.string().min(1, 'API secret cannot be empty').optional().transform(val => val === "" ? undefined : val),
});

export const getUsersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type EditUserInput = z.infer<typeof editUserSchema>;
export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>;