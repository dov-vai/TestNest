import { z } from "zod";

export const topicSchema = z.object({
  id: z.number().int().positive().describe("Topic id"),
  title: z.string().describe("Topic title"),
  description: z.string().nullable().optional().describe("Topic description (nullable)"),
  userId: z.number().int().nullable().optional().describe("Creator id"),
  isPrivate: z.boolean().describe("Whether topic is private"),
  createdAt: z.iso.datetime().describe("Created at (ISO)"),
  updatedAt: z.iso.datetime().describe("Updated at (ISO)"),
});

export const topicListSchema = z.array(topicSchema);

export const topicCreateSchema = z.object({
  title: z.string().min(1).describe("Topic title"),
  description: z.string().optional().describe("Optional topic description"),
  userId: z.coerce.number().int().optional().describe("Creator id (optional)"),
  isPrivate: z.boolean().optional().describe("Whether topic is private (optional)"),
});

export const topicUpdateSchema = z.object({
  title: z.string().min(1).optional().describe("New title (optional)"),
  description: z.string().nullable().optional().describe("New description (nullable, optional)"),
  isPrivate: z.boolean().optional().describe("Whether topic is private (optional)"),
});


