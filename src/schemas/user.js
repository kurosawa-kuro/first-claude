import { z } from 'zod';

export const UserSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  createdAt: z.string().datetime()
});

export const UserArraySchema = z.array(UserSchema);

export const ErrorSchema = z.object({
  error: z.string(),
  message: z.string().optional()
});