import { z } from 'zod';
import { questionSchema } from './question';

export const topicQuestionSchema = z.object({
  id: z.number().int().positive().describe('Link id'),
  topicId: z.number().int().positive().describe('Topic id'),
  questionId: z.number().int().positive().describe('Question id'),
  orderIdx: z.number().int().min(0).describe('Order index'),
  points: z.number().int().min(0).describe('Points'),
});

export const topicQuestionListSchema = z.array(topicQuestionSchema);

export const topicQuestionLinkSchema = z.object({
  topicId: z.coerce.number().int().positive().describe('Topic id'),
  questionId: z.coerce.number().int().positive().describe('Question id'),
  orderIdx: z.coerce.number().int().min(0).default(0).describe('Order index within topic'),
  points: z.coerce.number().int().min(0).default(0).describe('Points for this question in topic'),
});

export const topicQuestionUpdateSchema = z.object({
  orderIdx: z.coerce.number().int().min(0).optional().describe('New order index'),
  points: z.coerce.number().int().min(0).optional().describe('New points value'),
});

export const topicQuestionWithQuestionSchema = z.object({
  id: z.number().int().positive().describe('Link id'),
  topicId: z.number().int().positive().describe('Topic id'),
  questionId: z.number().int().positive().describe('Question id'),
  orderIdx: z.number().int().min(0).describe('Order index'),
  points: z.number().int().min(0).describe('Points'),
  question: questionSchema.describe('Embedded question'),
});

export const topicQuestionWithQuestionListSchema = z.array(topicQuestionWithQuestionSchema);
