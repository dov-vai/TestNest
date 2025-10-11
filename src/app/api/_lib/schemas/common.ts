import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive().describe('Positive integer id'),
});

export const paginationSchema = z.object({
  limit: z.preprocess(
    (v) => (v === null || v === '' ? undefined : v),
    z.coerce.number().int().min(1).max(100).default(50).describe('Items per page (1-100)')
  ),
  offset: z.coerce.number().int().min(0).default(0).describe('Offset from start (>=0)'),
});

export const deletedSchema = z.object({
  id: z.coerce.number().int().positive().describe('Deleted id'),
});
