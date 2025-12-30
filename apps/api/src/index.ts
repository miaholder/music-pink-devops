export interface Env {
  DB: D1Database;
}

type SearchResult = {
  trackName: string;
  artistName: string;
  sourceUrl?: string;
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    };

    // Preflight (helps if you later tighten CORS)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          ...headers,
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // Health check (add version marker so you can verify deployments)
    if (url.pathname === "/api/health" && request.method === "GET") {
      return new Response(
        JSON.stringify({ status: "ok", version: "musicbrainz-search-v1" }),
        { headers }
      );
    }

    // Create user
    if (url.pathname === "/api/users" && request.method === "POST") {
      let body: any = null;
      try {
        body = await request.json();
      } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON" }), {
          status: 400,
          headers,
        });
      }

      const username = (body?.username || "").trim();
      if (!username) {
        return new Response(JSON.stringify({ error: "Username required" }), {
          status: 400,
          headers,
        });
      }

      await env.DB
        .prepare("INSERT OR IGNORE INTO users (username) VALUES (?)")
        .bind(username)
        .run();

      return new Response(JSON.stringify({ username }), { headers });
    }

    // Search music (MusicBrainz Search API)
    // GET /api/search?q=...
    if (url.pathname === "/api/search" && request.method === "GET") {
      const q = (url.searchParams.get("q") || "").trim();

      if (!q) {
        return new Response(JSON.stringify({ results: [] as SearchResult[] }), {
          headers,
        });
      }

      // MusicBrainz search uses Lucene-style query; simplest approach: search recordings by free text.
      // Docs: MusicBrainz API Search + Search Server. :contentReference[oaicite:2]{index=2}
      const mbUrl =
        "https://musicbrainz.org/ws/2/recording?fmt=json&limit=10&query=" +
        encodeURIComponent(q);

      try {
        const res = await fetch(mbUrl, {
          headers: {
            // MusicBrainz asks for a meaningful User-Agent so they can contact maintainers if needed. :contentReference[oaicite:3]{index=3}
            "User-Agent": "music-pink-devops/1.0 (contact: miaholder)",
            "Accept": "application/json",
          },
        });

        // Don’t break your app or your CD on upstream issues.
        if (!res.ok) {
          return new Response(
            JSON.stringify({
              results: [] as SearchResult[],
              upstream_error: `MusicBrainz returned ${res.status}`,
            }),
            { status: 200, headers }
          );
        }

        const data: any = await res.json();
        const recordings = Array.isArray(data?.recordings) ? data.recordings : [];

        const results: SearchResult[] = recordings.map((r: any) => {
          const trackName = r?.title || "Unknown track";
          const artistName =
            (Array.isArray(r?.["artist-credit"]) && r["artist-credit"][0]?.name) ||
            "Unknown artist";
          const sourceUrl = r?.id
            ? `https://musicbrainz.org/recording/${r.id}`
            : undefined;

          return { trackName, artistName, sourceUrl };
        });

        return new Response(JSON.stringify({ results }), { headers });
      } catch (e) {
        return new Response(
          JSON.stringify({
            results: [] as SearchResult[],
            upstream_error: "MusicBrainz fetch failed",
          }),
          { status: 200, headers }
        );
      }
    }

    return new Response(JSON.stringify({ error: "Not Found" }), {
      status: 404,
      headers,
    });
  },
};

