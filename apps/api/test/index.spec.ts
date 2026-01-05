import { describe, it, expect } from "vitest";
import worker from "../src/index";

describe("API health endpoint", () => {
  it("responds with status ok", async () => {
    const request = new Request("http://localhost/api/health");
    const response = await worker.fetch(request, {} as any);

    expect(response.status).toBe(200);

    const data = await response.json();

    // Only assert what matters for health checks:
    expect(data).toMatchObject({ status: "ok" });

    // Optional: if version exists, ensure it is a string
    if ("version" in data) {
      expect(typeof (data as any).version).toBe("string");
    }
  });
});

