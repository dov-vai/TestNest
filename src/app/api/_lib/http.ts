import z, { ZodError } from "zod";

export function json(data: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data), {
    headers: { "content-type": "application/json", ...(init.headers || {}) },
    status: init.status || 200,
  });
}

export function badRequest(error: unknown): Response {
  if (error instanceof ZodError) {
    return json({ error: "Invalid request", issues: z.treeifyError(error) }, { status: 400 });
  }
  return json({ error: String(error) }, { status: 400 });
}

export function notFound(message = "Not found"): Response {
  return json({ error: message }, { status: 404 });
}

export function methodNotAllowed(method: string): Response {
  return json({ error: `${method} not allowed` }, { status: 405 });
}

export function serverError(error: unknown): Response {
  return json({ error: "Internal Server Error", detail: String(error) }, { status: 500 });
}

