import { pgTable, serial, text, integer, boolean, timestamp, pgEnum, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const questionType = pgEnum("question_type", [
  "multi",
  "single",
  "true_false",
  "fill_blank",
]);

export const topics = pgTable("topic", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const questions = pgTable("question", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  type: questionType("type").notNull(),
});

export const answers = pgTable("answer", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  isCorrect: boolean("is_correct").notNull().default(false),
  orderIdx: integer("order_idx").notNull().default(0),
});

export const topicQuestions = pgTable(
  "topic_question",
  {
    id: serial("id").primaryKey(),
    topicId: integer("topic_id").notNull().references(() => topics.id, { onDelete: "cascade" }),
    questionId: integer("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
    orderIdx: integer("order_idx").notNull().default(0),
    points: integer("points").notNull().default(0),
  },
  (tq) => ({
    uqTopicQuestion: uniqueIndex("uq_topic_question").on(tq.topicId, tq.questionId),
  })
);

export const topicsRelations = relations(topics, ({ many }) => ({
  topicQuestions: many(topicQuestions),
}));

export const questionsRelations = relations(questions, ({ many }) => ({
  answers: many(answers),
  topicQuestions: many(topicQuestions),
}));

export const answersRelations = relations(answers, ({}) => ({}));

export const topicQuestionsRelations = relations(topicQuestions, ({ } ) => ({}));

export type Topic = typeof topics.$inferSelect;
export type NewTopic = typeof topics.$inferInsert;
export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;
export type Answer = typeof answers.$inferSelect;
export type NewAnswer = typeof answers.$inferInsert;
export type TopicQuestion = typeof topicQuestions.$inferSelect;
export type NewTopicQuestion = typeof topicQuestions.$inferInsert;

