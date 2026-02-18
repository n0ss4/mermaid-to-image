import { parseFlowchart, serializeFlowchart, validateFlowchartDocument, type DiagramDocument } from "@repo/core";

function json(data: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
  });
}

async function readJson<T>(req: Request): Promise<T | null> {
  try {
    return await req.json() as T;
  } catch {
    return null;
  }
}

const server = Bun.serve({
  port: Number(process.env.PORT ?? 3001),
  fetch: async (req) => {
    const url = new URL(req.url);

    if (req.method === "GET" && url.pathname === "/health") {
      return json({ ok: true, service: "api" });
    }

    if (req.method === "POST" && url.pathname === "/v1/diagram/parse") {
      const body = await readJson<{ code?: string }>(req);
      if (!body?.code || typeof body.code !== "string") {
        return json({ error: "Invalid payload: code is required" }, { status: 400 });
      }
      const result = parseFlowchart(body.code);
      return json(result);
    }

    if (req.method === "POST" && url.pathname === "/v1/diagram/serialize") {
      const body = await readJson<{ doc?: DiagramDocument }>(req);
      if (!body?.doc) {
        return json({ error: "Invalid payload: doc is required" }, { status: 400 });
      }
      const code = serializeFlowchart(body.doc);
      return json({ code });
    }

    if (req.method === "POST" && url.pathname === "/v1/diagram/validate") {
      const body = await readJson<{ doc?: DiagramDocument }>(req);
      if (!body?.doc) {
        return json({ error: "Invalid payload: doc is required" }, { status: 400 });
      }
      const issues = validateFlowchartDocument(body.doc);
      return json({ issues });
    }

    return json({ error: "Not found" }, { status: 404 });
  },
});

console.log(`API running at http://localhost:${server.port}`);
