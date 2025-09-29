import { z } from "zod";

export const topicSchema = z.object({
  id: z.number().int().positive().describe("Topic id"),
  title: z.string().describe("Topic title"),
  description: z.string().nullable().optional().describe("Topic description (nullable)"),
  createdBy: z.string().nullable().optional().describe("Creator identifier"),
  createdAt: z.iso.datetime().describe("Created at (ISO)"),
  updatedAt: z.iso.datetime().describe("Updated at (ISO)"),
});

export const topicListSchema = z.array(topicSchema);

export const questionSchema = z.object({
  id: z.number().int().positive().describe("Question id"),
  text: z.string().describe("Question text"),
  type: z.enum(["multi", "single", "true_false", "fill_blank"]).describe("Question type"),
});

export const questionListSchema = z.array(questionSchema);

export const answerSchema = z.object({
  id: z.number().int().positive().describe("Answer id"),
  questionId: z.number().int().positive().describe("Question id"),
  text: z.string().describe("Answer text"),
  isCorrect: z.boolean().describe("Is correct"),
  orderIdx: z.number().int().min(0).describe("Order index"),
});

export const answerListSchema = z.array(answerSchema);

export const topicQuestionSchema = z.object({
  id: z.number().int().positive().describe("Link id"),
  topicId: z.number().int().positive().describe("Topic id"),
  questionId: z.number().int().positive().describe("Question id"),
  orderIdx: z.number().int().min(0).describe("Order index"),
  points: z.number().int().min(0).describe("Points"),
});

export const topicQuestionListSchema = z.array(topicQuestionSchema);

export const topicCreateSchema = z.object({
  title: z.string().min(1).describe("Topic title"),
  description: z.string().optional().describe("Optional topic description"),
  createdBy: z.string().optional().describe("Creator identifier (optional)"),
});

export const topicUpdateSchema = z.object({
  title: z.string().min(1).optional().describe("New title (optional)"),
  description: z.string().nullable().optional().describe("New description (nullable, optional)"),
});

export const idParamSchema = z.object({ id: z.coerce.number().int().positive().describe("Positive integer id") });

export const paginationSchema = z.object({
    limit: z.preprocess(
        v => (v === null || v === "" ? undefined : v),
        z.coerce.number().int().min(1).max(100).default(50).describe("Items per page (1-100)")
      ),
      offset: z.coerce.number().int().min(0).default(0).describe("Offset from start (>=0)")
  });

export const questionCreateSchema = z.object({
  text: z.string().min(1).describe("Question text"),
  type: z.enum(["multi", "single", "true_false", "fill_blank"]).describe("Question type"),
});

export const questionUpdateSchema = z.object({
  text: z.string().min(1).optional().describe("Updated text"),
  type: z.enum(["multi", "single", "true_false", "fill_blank"]).optional().describe("Updated type"),
});

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

export const topicQuestionLinkSchema = z.object({
  topicId: z.coerce.number().int().positive().describe("Topic id"),
  questionId: z.coerce.number().int().positive().describe("Question id"),
  orderIdx: z.coerce.number().int().min(0).default(0).describe("Order index within topic"),
  points: z.coerce.number().int().min(0).default(0).describe("Points for this question in topic"),
});

export const topicQuestionUpdateSchema = z.object({
  orderIdx: z.coerce.number().int().min(0).optional().describe("New order index"),
  points: z.coerce.number().int().min(0).optional().describe("New points value"),
});

export const deletedSchema = z.object({
  id: z.coerce.number().int().positive().describe("Deleted id"),
});

// Full schema for topic with questions and answer
// OpenAPI generator doesn't support z.extend or spread operator so have to copy and paste it...
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