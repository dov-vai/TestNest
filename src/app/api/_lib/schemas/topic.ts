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

export const topicCreateSchema = z.object({
  title: z.string().min(1).describe("Topic title"),
  description: z.string().optional().describe("Optional topic description"),
  createdBy: z.string().optional().describe("Creator identifier (optional)"),
});

export const topicUpdateSchema = z.object({
  title: z.string().min(1).optional().describe("New title (optional)"),
  description: z.string().nullable().optional().describe("New description (nullable, optional)"),
});


