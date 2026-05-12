import { z } from 'zod';

export const drugsQuerySchema = z.object({
  drug_class: z.string().optional(),
  medicine_type: z.string().optional(),
  letter: z.string().max(3).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(200).optional().default(50),
});

export const searchQuerySchema = z.object({
  q: z.string().min(1).max(200),
});

export const genericSearchQuerySchema = z.object({
  q: z.string().min(1).max(200).optional(),
});

export const slugParamSchema = z.object({
  slug: z.string().min(1).max(255).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug'),
});
