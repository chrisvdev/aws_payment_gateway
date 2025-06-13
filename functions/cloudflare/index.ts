import path from "node:path";
import type { RestLambdaDefinition } from "../../lib/constructs/rest_lambda.ts";

const __dirname = import.meta.dirname;

const cloudflareDefinition: RestLambdaDefinition = {
  entry: path.join(__dirname, "handler.ts"),
  restAPI: {
    "/api/v1/cloudflare": [{type: "POST", APIKeyRequired: false, requestSchema: null}],
  }
}

export default cloudflareDefinition;
