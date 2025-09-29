import { z } from "zod";

export const answerSchema = z.object({
  id: z.number().int().positive().describe("Answer id"),
  questionId: z.number().int().positive().describe("Question id"),
  text: z.string().describe("Answer text"),
  isCorrect: z.boolean().describe("Is correct"),
  orderIdx: z.number().int().min(0).describe("Order index"),
});

export const answerListSchema = z.array(answerSchema);

export const answerCreateSchema = z.object({
  questionId: z.coerce.number().int().positive().describe("Related question id"),
  text: z.string().min(1).describe("Answer text"),
  isCorrect: z.boolean().default(false).describe("Marks if answer is correct"),
  orderIdx: z.coerce.number().int().min(0).default(0).describe("Ordering index (>=0)"),
});

export const answerUpdateSchema = z.object({
  text: z.string().min(1).optional().describe("Updated text"),
  isCorrect: z.boolean().optional().describe("Updated correctness"),
  orderIdx: z.coerce.number().int().min(0).optional().describe("Updated order index"),
});


