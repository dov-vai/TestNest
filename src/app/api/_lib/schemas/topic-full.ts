import { z } from "zod";
import { answerListSchema } from "./answer";

export const questionWithAnswersSchema = z.object({
  id: z.number().int().positive().describe("Question id"),
  text: z.string().describe("Question text"),
  type: z.enum(["multi", "single", "true_false", "fill_blank"]).describe("Question type"),
  answers: answerListSchema,
});

export const topicQuestionFullSchema = z.object({
  id: z.number().int().positive().describe("Link id"),
  topicId: z.number().int().positive().describe("Topic id"),
  questionId: z.number().int().positive().describe("Question id"),
  orderIdx: z.number().int().min(0).describe("Order index"),
  points: z.number().int().min(0).describe("Points"),
  question: questionWithAnswersSchema.nullable(),
});

export const topicFullSchema = z.object({
  id: z.number().int().positive().describe("Topic id"),
  title: z.string().describe("Topic title"),
  description: z.string().nullable().optional().describe("Topic description (nullable)"),
  createdBy: z.string().nullable().optional().describe("Creator identifier"),
  createdAt: z.iso.datetime().describe("Created at (ISO)"),
  updatedAt: z.iso.datetime().describe("Updated at (ISO)"),
  questions: z.array(topicQuestionFullSchema),
});


