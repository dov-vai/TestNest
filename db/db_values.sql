BEGIN;

TRUNCATE TABLE topic_question, answer, question, topic RESTART IDENTITY CASCADE;

-- Topics
INSERT INTO topic (title, description, created_by) VALUES
  ('Basic Math', 'Arithmetic and algebra basics', 'alice'),
  ('World Geography', 'Capitals, continents, and countries', 'bob'),
  ('Programming Fundamentals', 'Core CS and languages', 'carol');

-- Questions
INSERT INTO question (text, type) VALUES
  ('What is 2 + 2?', 'single'),                                   -- id 1
  ('Select all prime numbers.', 'multi'),                          -- id 2
  ('Zero is an even number.', 'true_false'),                       -- id 3
  ('The derivative of x^2 is __.', 'fill_blank'),                  -- id 4
  ('What is the capital of France?', 'single'),                    -- id 5
  ('Select all countries in South America.', 'multi'),             -- id 6
  ('The equator passes through Brazil.', 'true_false'),            -- id 7
  ('The largest ocean on Earth is the __ Ocean.', 'fill_blank'),  -- id 8
  ('Which language runs in a web browser?', 'single'),             -- id 9
  ('Which of the following are statically typed languages?', 'multi'), -- id 10
  ('In Git, "merge" combines the histories of branches.', 'true_false'), -- id 11
  ('The time complexity of binary search is O(__).', 'fill_blank');     -- id 12

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

COMMIT;