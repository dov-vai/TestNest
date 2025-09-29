import { z } from "zod";

export const questionSchema = z.object({
  id: z.number().int().positive().describe("Question id"),
  text: z.string().describe("Question text"),
  type: z.enum(["multi", "single", "true_false", "fill_blank"]).describe("Question type"),
});

export const questionListSchema = z.array(questionSchema);

export const questionCreateSchema = z.object({
  text: z.string().min(1).describe("Question text"),
  type: z.enum(["multi", "single", "true_false", "fill_blank"]).describe("Question type"),
});

export const questionUpdateSchema = z.object({
  text: z.string().min(1).optional().describe("Updated text"),
  type: z.enum(["multi", "single", "true_false", "fill_blank"]).optional().describe("Updated type"),
});


