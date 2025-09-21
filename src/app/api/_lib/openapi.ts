const openapi = {
  openapi: "3.0.3",
  info: {
    title: "TestNest API",
    version: "1.0.0",
  },
  servers: [{ url: "/" }],
  paths: {
    "/api/topics": {
      get: {
        summary: "List topics",
        parameters: [
          { name: "limit", in: "query", schema: { type: "integer" } },
          { name: "offset", in: "query", schema: { type: "integer" } },
        ],
        responses: { "200": { description: "OK" } },
      },
      post: {
        summary: "Create topic",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  createdBy: { type: "string" },
                },
                required: ["title"],
              },
            },
          },
        },
        responses: { "201": { description: "Created" } },
      },
    },
    "/api/topics/{id}": {
      get: {
        summary: "Get topic",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { "200": { description: "OK" }, "404": { description: "Not found" } },
      },
      patch: {
        summary: "Update topic",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string", nullable: true },
                },
              },
            },
          },
        },
        responses: { "200": { description: "OK" }, "404": { description: "Not found" } },
      },
      delete: {
        summary: "Delete topic",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { "200": { description: "OK" }, "404": { description: "Not found" } },
      },
    },
    "/api/topics/{id}/full": {
      get: {
        summary: "Get topic with questions and answers",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { "200": { description: "OK" }, "404": { description: "Not found" } },
      },
    },
    "/api/questions": {
      get: {
        summary: "List questions",
        parameters: [
          { name: "limit", in: "query", schema: { type: "integer" } },
          { name: "offset", in: "query", schema: { type: "integer" } },
        ],
        responses: { "200": { description: "OK" } },
      },
      post: {
        summary: "Create question",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  text: { type: "string" },
                  type: { type: "string", enum: ["multi", "single", "true_false", "fill_blank"] },
                },
                required: ["text", "type"],
              },
            },
          },
        },
        responses: { "201": { description: "Created" } },
      },
    },
    "/api/questions/{id}": {
      get: {
        summary: "Get question",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { "200": { description: "OK" }, "404": { description: "Not found" } },
      },
      patch: {
        summary: "Update question",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  text: { type: "string" },
                  type: { type: "string", enum: ["multi", "single", "true_false", "fill_blank"] },
                },
              },
            },
          },
        },
        responses: { "200": { description: "OK" }, "404": { description: "Not found" } },
      },
      delete: {
        summary: "Delete question",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { "200": { description: "OK" }, "404": { description: "Not found" } },
      },
    },
    "/api/answers": {
      get: {
        summary: "List answers",
        parameters: [
          { name: "limit", in: "query", schema: { type: "integer" } },
          { name: "offset", in: "query", schema: { type: "integer" } },
        ],
        responses: { "200": { description: "OK" } },
      },
      post: {
        summary: "Create answer",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  questionId: { type: "integer" },
                  text: { type: "string" },
                  isCorrect: { type: "boolean" },
                  orderIdx: { type: "integer" },
                },
                required: ["questionId", "text"],
              },
            },
          },
        },
        responses: { "201": { description: "Created" } },
      },
    },
    "/api/answers/{id}": {
      get: {
        summary: "Get answer",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { "200": { description: "OK" }, "404": { description: "Not found" } },
      },
      patch: {
        summary: "Update answer",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  text: { type: "string" },
                  isCorrect: { type: "boolean" },
                  orderIdx: { type: "integer" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "OK" }, "404": { description: "Not found" } },
      },
      delete: {
        summary: "Delete answer",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { "200": { description: "OK" }, "404": { description: "Not found" } },
      },
    },
    "/api/topics/{id}/questions": {
      get: {
        summary: "List topic-question links",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { "200": { description: "OK" } },
      },
      post: {
        summary: "Link question to topic",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  questionId: { type: "integer" },
                  orderIdx: { type: "integer" },
                  points: { type: "integer" },
                },
                required: ["questionId"],
              },
            },
          },
        },
        responses: { "201": { description: "Created" } },
      },
    },
    "/api/topics/{id}/questions/{linkId}": {
      patch: {
        summary: "Update link",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
          { name: "linkId", in: "path", required: true, schema: { type: "integer" } },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  orderIdx: { type: "integer" },
                  points: { type: "integer" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "OK" }, "404": { description: "Not found" } },
      },
      delete: {
        summary: "Unlink question from topic",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
          { name: "linkId", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: { "200": { description: "OK" }, "404": { description: "Not found" } },
      },
    },
  },
} as const;

export default openapi;

