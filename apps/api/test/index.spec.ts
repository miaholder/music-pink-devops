import { describe, it, expect } from "vitest";
import worker from "../src";

describe("API health endpoint", () => {
  it("responds with status ok", async () => {
    const request = new Request("http://localhost/api/health");
    const response = await worker.fetch(request, {} as any);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok" });
  });
});

