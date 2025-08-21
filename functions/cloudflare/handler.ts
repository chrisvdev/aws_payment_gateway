import { lambda, logger } from "../lib/lambda.ts";
import { type Request, Response } from "./schemas.ts";
import cloudflareTurnstileService from "../lib/services/cloudflare_turnstile.ts";

export const handler = lambda.HTTPEventHandler<Request, Response>(
  async (event) => {
    if (!event.body?.token) {
      return {
        statusCode: 400,
        body: { token: "missing" },
      };
    }

    const token = event.body.token;
    const { "X-Forwarded-For": ip } = event.headers;

    const isValid = await cloudflareTurnstileService.verify(token, ip);

    return {
      statusCode: 200,
      body: {
        token: isValid ? "valid" : "invalid",
      },
    };
  }
)
