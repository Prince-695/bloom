import open from "open";
import { saveAuth } from "../lib/auth";

const LOGIN_TIMEOUT_MS = 5 * 60 * 1000;

type OAuthState = {
  nonce: string;
  port: number;
};

function toBase64Url(input: Uint8Array | string) {
  return Buffer.from(input).toString("base64url");
}

function encodeState(state: OAuthState) {
  return toBase64Url(JSON.stringify(state));
}

function decodeState(state: string) {
  const [encoded] = state.split(".");
  if (!encoded) {
    throw new Error("Invalid state");
  }

  return JSON.parse(Buffer.from(encoded, "base64url").toString()) as OAuthState;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Opens Bloom web /cli/auth, receives one-time code on loopback, exchanges for API token.
 */
export async function performLogin() {
  const appUrl = process.env.APP_URL ?? "http://localhost:3001";
  const apiUrl = process.env.API_URL ?? "http://localhost:3000";

  const nonce = crypto.randomUUID();
  let settled = false;

  return new Promise<{ token: string }>((resolve, reject) => {
    const server = Bun.serve({
      port: 0,
      async fetch(req) {
        const url = new URL(req.url);

        if (url.pathname !== "/callback") {
          return new Response("Not found", { status: 404 });
        }

        const error = url.searchParams.get("error");
        if (error) {
          const msg = url.searchParams.get("error_description") ?? error;
          settled = true;
          reject(new Error(msg));
          setTimeout(() => server.stop(), 500);
          return new Response(`Authentication failed: ${msg}`, { status: 400 });
        }

        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");

        if (!code || !state) {
          settled = true;
          reject(new Error("Missing code or state"));
          setTimeout(() => server.stop(), 500);
          return new Response("Bad request", { status: 400 });
        }

        try {
          const decoded = decodeState(state);
          if (decoded.nonce !== nonce || decoded.port !== server.port) {
            throw new Error("State mismatch");
          }

          const exchangeRes = await fetch(`${apiUrl}/auth/cli/exchange`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, state }),
          });

          if (!exchangeRes.ok) {
            const body = (await exchangeRes.json().catch(() => null)) as {
              error?: string;
            } | null;
            throw new Error(body?.error ?? "Token exchange failed");
          }

          const data = (await exchangeRes.json()) as {
            token: string;
            userId?: string;
          };

          await saveAuth({
            token: data.token,
            userId: data.userId,
          });

          settled = true;
          resolve({ token: data.token });
          setTimeout(() => server.stop(), 500);
          return new Response(
            "<html><body><h1>Login successful</h1><p>You can close this tab and return to Bloom.</p></body></html>",
            { headers: { "Content-Type": "text/html" } },
          );
        } catch (error) {
          settled = true;
          reject(error instanceof Error ? error : new Error(getErrorMessage(error)));
          setTimeout(() => server.stop(), 500);
          return new Response(`Authentication failed: ${getErrorMessage(error)}`, {
            status: 400,
          });
        }
      },
    });

    const port = server.port;
    if (port == null) {
      server.stop();
      reject(new Error("Failed to bind local login callback port"));
      return;
    }

    const state = encodeState({ nonce, port });
    const authorizeUrl = new URL("/cli/auth", appUrl);
    authorizeUrl.searchParams.set("port", String(port));
    authorizeUrl.searchParams.set("state", state);

    void open(authorizeUrl.toString());

    setTimeout(() => {
      if (!settled) {
        settled = true;
        server.stop();
        reject(new Error("Login timed out"));
      }
    }, LOGIN_TIMEOUT_MS);
  });
}
