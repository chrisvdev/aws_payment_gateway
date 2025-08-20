import path from "node:path";
import type { RestLambdaDefinition } from "../../lib/constructs/rest_lambda.ts";
import { requestJsonSchema } from "./schemas.ts";

// @ts-expect-error
const __dirname = import.meta.dirname;

const cloudflareDefinition: RestLambdaDefinition = {
  entry: path.join(__dirname, "handler.ts"),
  restAPI: {
    "/api/v1/cloudflare": { "POST": { APIKeyRequired: false, requestSchema: requestJsonSchema } },
  }
}

export default cloudflareDefinition;
