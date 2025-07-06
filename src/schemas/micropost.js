import { z } from 'zod';

export const MicropostSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  content: z.string().min(1, 'Content is required').max(280, 'Content must be 280 characters or less'),
  createdAt: z.string().datetime().optional()
});

export const MicropostArraySchema = z.array(MicropostSchema);

export const CreateMicropostSchema = z.object({
  content: z.string().min(1, 'Content is required').max(280, 'Content must be 280 characters or less')
});

export const MicropostParamsSchema = z.object({
  userId: z.string().regex(/^\d+$/, 'User ID must be a number').transform(Number)
});

export const ErrorSchema = z.object({
  error: z.string(),
  message: z.string().optional()
});