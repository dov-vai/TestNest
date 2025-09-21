import { z } from "zod";

export const topicCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  createdBy: z.string().optional(),
});

export const topicUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
});

export const idParamSchema = z.object({ id: z.coerce.number().int().positive() });

export const paginationSchema = z.object({
    limit: z.preprocess(
        v => (v === null || v === "" ? undefined : v),
        z.coerce.number().int().min(1).max(100).default(50)
      ),
      offset: z.coerce.number().int().min(0).default(0)
  });

export const questionCreateSchema = z.object({
  text: z.string().min(1),
  type: z.enum(["multi", "single", "true_false", "fill_blank"]),
});

export const questionUpdateSchema = z.object({
  text: z.string().min(1).optional(),
  type: z.enum(["multi", "single", "true_false", "fill_blank"]).optional(),
});

export const answerCreateSchema = z.object({
  questionId: z.coerce.number().int().positive(),
  text: z.string().min(1),
  isCorrect: z.boolean().default(false),
  orderIdx: z.coerce.number().int().min(0).default(0),
});

export const answerUpdateSchema = z.object({
  text: z.string().min(1).optional(),
  isCorrect: z.boolean().optional(),
  orderIdx: z.coerce.number().int().min(0).optional(),
});

export const topicQuestionLinkSchema = z.object({
  topicId: z.coerce.number().int().positive(),
  questionId: z.coerce.number().int().positive(),
  orderIdx: z.coerce.number().int().min(0).default(0),
  points: z.coerce.number().int().min(0).default(0),
});

export const topicQuestionUpdateSchema = z.object({
  orderIdx: z.coerce.number().int().min(0).optional(),
  points: z.coerce.number().int().min(0).optional(),
});
