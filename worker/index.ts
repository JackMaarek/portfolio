/** Cloudflare Worker entry point for the vinext-starter template. */
import { isImageOptimizationPath } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import { withSecurityHeaders } from "./security-headers";

interface Env {
  ASSETS: Fetcher;
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Every <Image> on the site is `unoptimized`, so the optimizer endpoints
    // (/_next/image, /_vinext/image) are dead surface: refuse them instead of
    // parsing untrusted image payloads.
    if (isImageOptimizationPath(url.pathname)) {
      return withSecurityHeaders(new Response("Not Found", { status: 404 }), url);
    }

    const response = await handler.fetch(request, env, ctx);
    return withSecurityHeaders(response, url);
  },
};

export default worker;
