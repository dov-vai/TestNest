# TestNest API

# Tech Stack

Next.js for backend and frontend.

The database will be using PostgreSQL, and Drizzle ORM.

# Tables
Database tables for the hierarchical structure:
Topic -> Question -> Answer

Topic, Topic_Question, Question, Answer

Topic can be made up of many Topic_Questions. Question can have multiple answer.
Questions can be reused between topics, that's why there's a Topic_Question table.

Topic: id, title, description, created_by

Topic_Question: id, topic_id, question_id, order_idx, points

Question: id, text, type: (enum: multi, single, true_false, fill_blank)

Answer: id, question_id, text, is_correct, order_idx


Create a database.sql file for creating the whole database.

# API

Topic, Question, Answer will each have CRUD methods + one that returns a list.
At least one endpoint should return a hierarchical list, eg. return all questions and answer for the topic.
Let's do JSON for the outputs.

Endpoints must follow all rest principles. Status codes should be used correctly.

All endpoints must have OpenAPI specification.

# PostgreSQL

Create a docker compose file so I can launch and test postgres.

