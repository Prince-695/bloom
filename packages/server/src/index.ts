import { Hono } from "hono";
import { sentry } from "@sentry/hono/bun";
import * as Sentry from "@sentry/hono/bun";
import { HTTPException } from "hono/http-exception";
import { cors } from "hono/cors";
import sessions from "./routes/sessions";
import chat from "./routes/chat";
import usage from "./routes/usage";
import me from "./routes/me";
import authCliRoutes from "./features/auth/routes";
import { requireAuth } from "./middleware/require-auth";
import { auth } from "./integrations/better-auth";

const app = new Hono();

const appUrl = process.env.APP_URL ?? "http://localhost:3001";

app.use(
  "*",
  cors({
    origin: [appUrl, "http://localhost:3001"],
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
);

app.use(
  sentry(app, {
    dsn: "https://77f0e1f74cab77c8e304a27be778f4f5@o4511677096919040.ingest.de.sentry.io/4511677222813776",
    tracesSampleRate: 1.0,
    enableLogs: true,
    sendDefaultPii: true,
    dataCollection: {},
  }),
);

app.get("/debug-sentry", () => {
  Sentry.logger.info("User triggered test error", {
    action: "test_error_endpoint",
  });
  Sentry.metrics.count("test_counter", 1);
  throw new Error("My first Sentry error!");
});

app.onError((error, c) => {
  if (error instanceof HTTPException) {
    Sentry.logger.warn("Handled HTTP error", {
      status: error.status,
      message: error.message || "Request failed",
      path: c.req.path,
      method: c.req.method,
    });

    return c.json(
      {
        error: error.message || "Request failed",
      },
      error.status,
    );
  }

  return c.json({ error: "Internal server error" }, 500);
});

// Better Auth HTTP handler
app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.use("/sessions/*", requireAuth);
app.use("/chat/*", requireAuth);
app.use("/usage/*", requireAuth);
app.use("/usage", requireAuth);
app.use("/me", requireAuth);
app.use("/me/*", requireAuth);

const routes = app
  .route("/auth", authCliRoutes)
  .route("/usage", usage)
  .route("/me", me)
  .route("/sessions", sessions)
  .route("/chat", chat);

export type AppType = typeof routes;

// idleTimeout must be high, otherwise LLM tool calls might not complete
export default { port: 3000, fetch: app.fetch, idleTimeout: 255 };
