import { z } from 'zod';
import { INT32_MAX } from './constants';

export const attemptCreateSchema = z.object({
  topicId: z.number().int().positive().max(INT32_MAX).describe('Topic ID'),
});

export const answerSubmitSchema = z.object({
  topicQuestionId: z.number().int().positive().max(INT32_MAX).describe('Topic question link ID'),
  answerIds: z
    .array(z.number().int().positive().max(INT32_MAX))
    .optional()
    .describe('Selected answer IDs (for multiple choice)'),
  userAnswerText: z.string().max(1000).optional().nullable().describe('Text answer (for fill in the blank)'),
});

export const attemptCompleteSchema = z.object({
  isCompleted: z.boolean().describe('Mark attempt as completed'),
});

export const attemptSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  topicId: z.number().int().positive(),
  startedAt: z.iso.datetime(),
  submittedAt: z.iso.datetime().nullable(),
  totalPoints: z.number().int().min(0),
  earnedPoints: z.number().int().min(0),
  isCompleted: z.boolean(),
});

export const attemptListSchema = z.array(attemptSchema);

export const userAnswerSchema = z.object({
  id: z.number().int().positive(),
  attemptId: z.number().int().positive(),
  topicQuestionId: z.number().int().positive(),
  answerIds: z.array(z.number().int().positive()).optional(),
  userAnswerText: z.string().nullable(),
  isCorrect: z.boolean(),
  pointsAwarded: z.number().int().min(0),
  answeredAt: z.iso.datetime(),
});
