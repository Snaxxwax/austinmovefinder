// Performance middleware for Astro
import type { MiddlewareHandler } from "astro";

export const performanceMiddleware: MiddlewareHandler = async (
  context,
  next,
) => {
  const start = Date.now();

  // Add performance headers
  const response = await next();

  // Add cache headers for static assets
  if (
    context.url.pathname.match(/\.(js|css|woff2?|png|jpg|jpeg|webp|svg|ico)$/)
  ) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable",
    );
  }

  // Add preload hints for critical resources
  if (context.url.pathname === "/") {
    response.headers.set(
      "Link",
      [
        "</hero-background.webp>; rel=preload; as=image; type=image/webp",
        "<https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap>; rel=preload; as=style",
      ].join(", "),
    );
  }

  // Add security headers for performance
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Add performance timing header (for monitoring)
  const duration = Date.now() - start;
  response.headers.set("Server-Timing", `total;dur=${duration}`);

  return response;
};

export const onRequest = performanceMiddleware;
