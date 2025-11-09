BEGIN;

TRUNCATE TABLE topic_question, answer, question, topic, users RESTART IDENTITY CASCADE;

-- Users (password is 'password123' hashed with bcrypt)
INSERT INTO users (email, password_hash, name, role, is_active) VALUES
  ('user1@example.com', '$2b$10$rQZ8vZ8vZ8vZ8vZ8vZ8vZ.abcdefghijklmnopqrstuvwxyz1234', 'Alice Johnson', 'user', true),
  ('user2@example.com', '$2b$10$rQZ8vZ8vZ8vZ8vZ8vZ8vZ.abcdefghijklmnopqrstuvwxyz1234', 'Bob Smith', 'user', true),
  ('admin@example.com', '$2b$10$rQZ8vZ8vZ8vZ8vZ8vZ8vZ.abcdefghijklmnopqrstuvwxyz1234', 'Charlie Admin', 'admin', true);

-- Topics
INSERT INTO topic (title, description, user_id, is_private) VALUES
  ('Basic Math', 'Arithmetic and algebra basics', 1, false),
  ('World Geography', 'Capitals, continents, and countries', 2, true),
  ('Programming Fundamentals', 'Core CS and languages', 3, false);

-- Questions
INSERT INTO question (text, type, user_id) VALUES
  ('What is 2 + 2?', 'single', 1),                                   -- id 1
  ('Select all prime numbers.', 'multi', 1),                          -- id 2
  ('Zero is an even number.', 'true_false', 1),                       -- id 3
  ('The derivative of x^2 is __.', 'fill_blank', 1),                  -- id 4
  ('What is the capital of France?', 'single', 2),                    -- id 5
  ('Select all countries in South America.', 'multi', 2),             -- id 6
  ('The equator passes through Brazil.', 'true_false', 2),            -- id 7
  ('The largest ocean on Earth is the __ Ocean.', 'fill_blank', 2),  -- id 8
  ('Which language runs in a web browser?', 'single', 3),             -- id 9
  ('Which of the following are statically typed languages?', 'multi', 3), -- id 10
  ('In Git, "merge" combines the histories of branches.', 'true_false', 3), -- id 11
  ('The time complexity of binary search is O(__).', 'fill_blank', 3);     -- id 12

-- Answers
-- Q1
INSERT INTO answer (question_id, text, is_correct, order_idx) VALUES
  (1, '4', true, 0),
  (1, '5', false, 1),
  (1, '3', false, 2);

-- Q2
INSERT INTO answer (question_id, text, is_correct, order_idx) VALUES
  (2, '2', true, 0),
  (2, '3', true, 1),
  (2, '4', false, 2),
  (2, '5', true, 3);

-- Q3
INSERT INTO answer (question_id, text, is_correct, order_idx) VALUES
  (3, 'True', true, 0),
  (3, 'False', false, 1);

-- Q4
INSERT INTO answer (question_id, text, is_correct, order_idx) VALUES
  (4, '2x', true, 0);

-- Q5
INSERT INTO answer (question_id, text, is_correct, order_idx) VALUES
  (5, 'Paris', true, 0),
  (5, 'Lyon', false, 1),
  (5, 'Marseille', false, 2),
  (5, 'Berlin', false, 3);

-- Q6
INSERT INTO answer (question_id, text, is_correct, order_idx) VALUES
  (6, 'Brazil', true, 0),
  (6, 'Argentina', true, 1),
  (6, 'Spain', false, 2),
  (6, 'Peru', true, 3),
  (6, 'Mexico', false, 4);

-- Q7
INSERT INTO answer (question_id, text, is_correct, order_idx) VALUES
  (7, 'True', true, 0),
  (7, 'False', false, 1);

-- Q8
INSERT INTO answer (question_id, text, is_correct, order_idx) VALUES
  (8, 'Pacific', true, 0),
  (8, 'Atlantic', false, 1),
  (8, 'Indian', false, 2);

-- Q9
INSERT INTO answer (question_id, text, is_correct, order_idx) VALUES
  (9, 'JavaScript', true, 0),
  (9, 'C++', false, 1),
  (9, 'Java', false, 2),
  (9, 'Python', false, 3);

-- Q10
INSERT INTO answer (question_id, text, is_correct, order_idx) VALUES
  (10, 'Java', true, 0),
  (10, 'Go', true, 1),
  (10, 'TypeScript', true, 2),
  (10, 'Python', false, 3),
  (10, 'Ruby', false, 4);

-- Q11
INSERT INTO answer (question_id, text, is_correct, order_idx) VALUES
  (11, 'True', true, 0),
  (11, 'False', false, 1);

-- Q12
INSERT INTO answer (question_id, text, is_correct, order_idx) VALUES
  (12, 'log n', true, 0),
  (12, 'log(n)', true, 1),
  (12, 'n log n', false, 2);

-- Topic ↔ Question links
-- Topic 1: Basic Math
INSERT INTO topic_question (topic_id, question_id, order_idx, points) VALUES
  (1, 1, 0, 5),
  (1, 2, 1, 10),
  (1, 3, 2, 3),
  (1, 4, 3, 8);

-- Topic 2: World Geography
INSERT INTO topic_question (topic_id, question_id, order_idx, points) VALUES
  (2, 5, 0, 5),
  (2, 6, 1, 10),
  (2, 7, 2, 3),
  (2, 8, 3, 8);

-- Topic 3: Programming Fundamentals (reuses Q3)
INSERT INTO topic_question (topic_id, question_id, order_idx, points) VALUES
  (3, 9, 0, 5),
  (3, 10, 1, 10),
  (3, 11, 2, 3),
  (3, 12, 3, 8),
  (3, 3, 4, 2);

-- User Topic Attempts
-- User 1 completed Basic Math topic
INSERT INTO user_topic_attempt (user_id, topic_id, started_at, submitted_at, total_points, earned_points, is_completed) VALUES
  (1, 1, '2025-11-01 10:00:00+00', '2025-11-01 10:15:00+00', 26, 23, true);

-- User 1 started but didn't complete Programming Fundamentals
INSERT INTO user_topic_attempt (user_id, topic_id, started_at, submitted_at, total_points, earned_points, is_completed) VALUES
  (1, 3, '2025-11-05 14:30:00+00', NULL, 28, 15, false);

-- User 2 completed World Geography topic
INSERT INTO user_topic_attempt (user_id, topic_id, started_at, submitted_at, total_points, earned_points, is_completed) VALUES
  (2, 2, '2025-11-03 09:00:00+00', '2025-11-03 09:20:00+00', 26, 26, true);

-- User 2 completed Basic Math topic
INSERT INTO user_topic_attempt (user_id, topic_id, started_at, submitted_at, total_points, earned_points, is_completed) VALUES
  (2, 1, '2025-11-06 11:00:00+00', '2025-11-06 11:12:00+00', 26, 18, true);

-- User Answers
-- Attempt 1 (User 1, Basic Math, Completed) - topic_question ids: 1,2,3,4
INSERT INTO user_answer (attempt_id, topic_question_id, answer_id, user_answer_text, is_correct, points_awarded, answered_at) VALUES
  (1, 1, 1, NULL, true, 5, '2025-11-01 10:02:00+00'),   -- Q1: 2+2=4, correct
  (1, 2, 4, NULL, true, 10, '2025-11-01 10:05:00+00'),  -- Q2: Selected 2 (prime), correct
  (1, 3, 8, NULL, true, 3, '2025-11-01 10:08:00+00'),   -- Q3: Zero is even = True, correct
  (1, 4, NULL, '2x', true, 5, '2025-11-01 10:12:00+00'); -- Q4: Derivative of x^2, got partial credit (5/8)

-- Attempt 2 (User 1, Programming Fundamentals, In Progress) - topic_question ids: 9,10,11,12,13
INSERT INTO user_answer (attempt_id, topic_question_id, answer_id, user_answer_text, is_correct, points_awarded, answered_at) VALUES
  (2, 9, 25, NULL, true, 5, '2025-11-05 14:35:00+00'),   -- Q9: JavaScript, correct
  (2, 10, 26, NULL, true, 10, '2025-11-05 14:40:00+00'), -- Q10: Java (statically typed), correct
  (2, 11, 33, NULL, false, 0, '2025-11-05 14:45:00+00'); -- Q11: Git merge = False, incorrect (should be True)

-- Attempt 3 (User 2, World Geography, Completed) - topic_question ids: 5,6,7,8
INSERT INTO user_answer (attempt_id, topic_question_id, answer_id, user_answer_text, is_correct, points_awarded, answered_at) VALUES
  (3, 5, 12, NULL, true, 5, '2025-11-03 09:02:00+00'),    -- Q5: Paris, correct
  (3, 6, 14, NULL, true, 10, '2025-11-03 09:06:00+00'),   -- Q6: Brazil (South America), correct
  (3, 7, 19, NULL, true, 3, '2025-11-03 09:10:00+00'),    -- Q7: Equator passes Brazil = True, correct
  (3, 8, NULL, 'Pacific', true, 8, '2025-11-03 09:15:00+00'); -- Q8: Pacific Ocean, correct

-- Attempt 4 (User 2, Basic Math, Completed) - topic_question ids: 1,2,3,4
INSERT INTO user_answer (attempt_id, topic_question_id, answer_id, user_answer_text, is_correct, points_awarded, answered_at) VALUES
  (4, 1, 1, NULL, true, 5, '2025-11-06 11:02:00+00'),    -- Q1: 2+2=4, correct
  (4, 2, 5, NULL, false, 0, '2025-11-06 11:04:00+00'),   -- Q2: Selected 3 only, incorrect (missing 2 and 5)
  (4, 3, 8, NULL, true, 3, '2025-11-06 11:06:00+00'),    -- Q3: Zero is even = True, correct
  (4, 4, NULL, '2', false, 0, '2025-11-06 11:10:00+00'); -- Q4: Wrong answer (should be 2x), incorrect

COMMIT;