import { pgTable, serial, text, integer, boolean, timestamp, pgEnum, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const questionType = pgEnum('question_type', ['multi', 'single', 'true_false', 'fill_blank']);
export const userRole = pgEnum('user_role', ['user', 'admin']);

export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    name: text('name'),
    role: userRole('role').notNull().default('user'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_users_email').on(table.email)]
);

export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    replacedByToken: text('replaced_by_token'),
  },
  (table) => [index('idx_refresh_tokens_user_id').on(table.userId), index('idx_refresh_tokens_token').on(table.token)]
);

export const topics = pgTable('topic', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  isPrivate: boolean('is_private').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const questions = pgTable('question', {
  id: serial('id').primaryKey(),
  text: text('text').notNull(),
  type: questionType('type').notNull(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const answers = pgTable('answer', {
  id: serial('id').primaryKey(),
  questionId: integer('question_id')
    .notNull()
    .references(() => questions.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  isCorrect: boolean('is_correct').notNull().default(false),
  orderIdx: integer('order_idx').notNull().default(0),
});

export const topicQuestions = pgTable(
  'topic_question',
  {
    id: serial('id').primaryKey(),
    topicId: integer('topic_id')
      .notNull()
      .references(() => topics.id, { onDelete: 'cascade' }),
    questionId: integer('question_id')
      .notNull()
      .references(() => questions.id, { onDelete: 'cascade' }),
    orderIdx: integer('order_idx').notNull().default(0),
    points: integer('points').notNull().default(0),
  },
  (tq) => [uniqueIndex('uq_topic_question').on(tq.topicId, tq.questionId)]
);

export const userTopicAttempts = pgTable(
  'user_topic_attempt',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    topicId: integer('topic_id')
      .notNull()
      .references(() => topics.id, { onDelete: 'cascade' }),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    submittedAt: timestamp('submitted_at', { withTimezone: true }),
    totalPoints: integer('total_points').notNull().default(0),
    earnedPoints: integer('earned_points').notNull().default(0),
    isCompleted: boolean('is_completed').notNull().default(false),
  },
  (uta) => [
    index('idx_uta_user_id').on(uta.userId),
    index('idx_uta_topic_id').on(uta.topicId),
    index('idx_uta_user_topic').on(uta.userId, uta.topicId),
  ]
);

export const userAnswers = pgTable(
  'user_answer',
  {
    id: serial('id').primaryKey(),
    attemptId: integer('attempt_id')
      .notNull()
      .references(() => userTopicAttempts.id, { onDelete: 'cascade' }),
    topicQuestionId: integer('topic_question_id')
      .notNull()
      .references(() => topicQuestions.id, { onDelete: 'cascade' }),
    answerId: integer('answer_id').references(() => answers.id, { onDelete: 'set null' }),
    userAnswerText: text('user_answer_text'),
    isCorrect: boolean('is_correct').notNull().default(false),
    pointsAwarded: integer('points_awarded').notNull().default(0),
    answeredAt: timestamp('answered_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (ua) => [
    uniqueIndex('uq_attempt_topic_question').on(ua.attemptId, ua.topicQuestionId),
    index('idx_ua_attempt_id').on(ua.attemptId),
    index('idx_ua_topic_question_id').on(ua.topicQuestionId),
  ]
);

export const usersRelations = relations(users, ({ many }) => ({
  topics: many(topics),
  refreshTokens: many(refreshTokens),
  questions: many(questions),
  topicAttempts: many(userTopicAttempts),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

export const topicsRelations = relations(topics, ({ many, one }) => ({
  topicQuestions: many(topicQuestions),
  topicAttempts: many(userTopicAttempts),
  user: one(users, {
    fields: [topics.userId],
    references: [users.id],
  }),
}));

export const questionsRelations = relations(questions, ({ many, one }) => ({
  answers: many(answers),
  topicQuestions: many(topicQuestions),
  user: one(users, {
    fields: [questions.userId],
    references: [users.id],
  }),
}));

export const answersRelations = relations(answers, ({ one }) => ({
  question: one(questions, {
    fields: [answers.questionId],
    references: [questions.id],
  }),
}));

export const topicQuestionsRelations = relations(topicQuestions, ({ one, many }) => ({
  topic: one(topics, {
    fields: [topicQuestions.topicId],
    references: [topics.id],
  }),
  question: one(questions, {
    fields: [topicQuestions.questionId],
    references: [questions.id],
  }),
  userAnswers: many(userAnswers),
}));

export const userTopicAttemptsRelations = relations(userTopicAttempts, ({ one, many }) => ({
  user: one(users, {
    fields: [userTopicAttempts.userId],
    references: [users.id],
  }),
  topic: one(topics, {
    fields: [userTopicAttempts.topicId],
    references: [topics.id],
  }),
  userAnswers: many(userAnswers),
}));

export const userAnswersRelations = relations(userAnswers, ({ one }) => ({
  attempt: one(userTopicAttempts, {
    fields: [userAnswers.attemptId],
    references: [userTopicAttempts.id],
  }),
  topicQuestion: one(topicQuestions, {
    fields: [userAnswers.topicQuestionId],
    references: [topicQuestions.id],
  }),
  answer: one(answers, {
    fields: [userAnswers.answerId],
    references: [answers.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;
export type Topic = typeof topics.$inferSelect;
export type NewTopic = typeof topics.$inferInsert;
export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;
export type Answer = typeof answers.$inferSelect;
export type NewAnswer = typeof answers.$inferInsert;
export type TopicQuestion = typeof topicQuestions.$inferSelect;
export type NewTopicQuestion = typeof topicQuestions.$inferInsert;
export type UserTopicAttempt = typeof userTopicAttempts.$inferSelect;
export type NewUserTopicAttempt = typeof userTopicAttempts.$inferInsert;
export type UserAnswer = typeof userAnswers.$inferSelect;
export type NewUserAnswer = typeof userAnswers.$inferInsert;
