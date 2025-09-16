<h1 align="center">TestNest</h1>

# Goal

The goal of the project is to create an online platform for creating and taking tests, as well as for spaced repetition. The system should help learners more easily absorb knowledge, while teachers or instructors can more easily prepare sets of questions.  

Viewing or taking tests will not require registration.  
If a user wants to create tests, they will need to register on the platform. Once registered, the user can create a topic (a set of questions). A question may have single-choice, multiple-choice, yes/no, or open-ended answers. Questions can be reused and imported into other topics. A topic can be private or public, with public topics accessible to unregistered users. Test search will be available. After completing a test, the user can review the answers and see how many were correct (points scored).

## Functional Requirements

**Guest users will be able to:**
- Browse and view public tests;
- Take tests;
- Review test answers;
- Log in / register on the platform.

**Registered users will be able to:**
- Do everything a guest can do;
- Create new tests;
- View and manage their private tests;
- Track their test history, progress, and points scored;
- Add existing questions to their own tests;
- Delete and edit tests.

**Administrators will be able to:**
- Do everything a registered user can do;
- View, edit, or remove all user-created tests;
- Manage user accounts (block, remove).

# System Architecture

The system will be developed using **Next.js**, which will serve both as the client and server side.

**On the server side:**
- **Linux server** – main execution environment;
- **Nginx** – reverse proxy, used to route requests, since several subdomains run on the server;
- **JWT authentication** – for user login and session management;
- **PostgreSQL** – relational database to store tests, questions, answers, and user data;
- **Drizzle ORM** – lightweight ORM to simplify SQL operations.


The system deployment diagram is shown below.

<img width="912" height="376" alt="deployment" src="https://github.com/user-attachments/assets/587da4e4-c3fc-4a0d-9ced-e4a352c62d37" />
