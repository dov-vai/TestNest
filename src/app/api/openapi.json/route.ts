import { NextRequest } from "next/server";
import openapi from "../_lib/openapi";

export function GET(_req: NextRequest) {
  return new Response(JSON.stringify(openapi, null, 2), {
    headers: { "content-type": "application/json" },
  });
}

