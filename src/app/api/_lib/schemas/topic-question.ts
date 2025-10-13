import { z } from 'zod';
import { INT32_MAX } from './constants';
import { questionSchema } from './question';

export const topicQuestionSchema = z.object({
  id: z.number().int().positive().max(INT32_MAX).describe('Link id'),
  topicId: z.number().int().positive().max(INT32_MAX).describe('Topic id'),
  questionId: z.number().int().positive().max(INT32_MAX).describe('Question id'),
  orderIdx: z.number().int().min(0).max(INT32_MAX).describe('Order index (>=0)'),
  points: z.number().int().min(0).max(INT32_MAX).describe('Points (>=0)'),
});

export const topicQuestionListSchema = z.array(topicQuestionSchema);

export const topicQuestionLinkSchema = z.object({
  topicId: z.coerce.number().int().positive().max(INT32_MAX).describe('Topic id'),
  questionId: z.coerce.number().int().positive().max(INT32_MAX).describe('Question id'),
  orderIdx: z.coerce.number().int().min(0).max(INT32_MAX).default(0).describe('Order index within topic (>=0)'),
  points: z.coerce.number().int().min(0).max(INT32_MAX).default(0).describe('Points for this question in topic (>=0)'),
});

export const topicQuestionUpdateSchema = z.object({
  orderIdx: z.coerce.number().int().min(0).max(INT32_MAX).optional().describe('New order index (>=0)'),
  points: z.coerce.number().int().min(0).max(INT32_MAX).optional().describe('New points value (>=0)'),
});

export const topicQuestionWithQuestionSchema = z.object({
  id: z.number().int().positive().max(INT32_MAX).describe('Link id'),
  topicId: z.number().int().positive().max(INT32_MAX).describe('Topic id'),
  questionId: z.number().int().positive().max(INT32_MAX).describe('Question id'),
  orderIdx: z.number().int().min(0).max(INT32_MAX).describe('Order index (>=0)'),
  points: z.number().int().min(0).max(INT32_MAX).describe('Points (>=0)'),
  question: questionSchema.describe('Embedded question'),
});

export const topicQuestionWithQuestionListSchema = z.array(topicQuestionWithQuestionSchema);
