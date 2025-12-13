export interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    };

    // Health check
    if (url.pathname === "/api/health") {
      return new Response(JSON.stringify({ status: "ok" }), { headers });
    }

    // Create user
    if (url.pathname === "/api/users" && request.method === "POST") {
      const body = await request.json();
      const username = body.username;

      if (!username) {
        return new Response(
          JSON.stringify({ error: "Username required" }),
          { status: 400, headers }
        );
      }

      await env.DB
        .prepare("INSERT OR IGNORE INTO users (username) VALUES (?)")
        .bind(username)
        .run();

      return new Response(JSON.stringify({ username }), { headers });
    }

    return new Response(JSON.stringify({ error: "Not Found" }), {
      status: 404,
      headers,
    });
  },
};

