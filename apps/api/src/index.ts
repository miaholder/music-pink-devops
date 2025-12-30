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

    // Search music (public iTunes API)
    // GET /api/search?q=...
    if (url.pathname === "/api/search" && request.method === "GET") {
      const q = (url.searchParams.get("q") || "").trim();

      if (!q) {
        return new Response(JSON.stringify({ results: [] }), { headers });
      }

      const itunesUrl =
        "https://itunes.apple.com/search?media=music&limit=10&term=" +
        encodeURIComponent(q);

      const res = await fetch(itunesUrl);

      if (!res.ok) {
        return new Response(
          JSON.stringify({ error: "Upstream search failed" }),
          { status: 502, headers }
        );
      }

      const data: any = await res.json();

      const results = (data.results || []).map((r: any) => ({
        trackName: r.trackName,
        artistName: r.artistName,
        artworkUrl100: r.artworkUrl100,
        previewUrl: r.previewUrl,
        trackViewUrl: r.trackViewUrl,
      }));

      return new Response(JSON.stringify({ results }), { headers });
    }


    return new Response(JSON.stringify({ error: "Not Found" }), {
      status: 404,
      headers,
    });
  },
};

