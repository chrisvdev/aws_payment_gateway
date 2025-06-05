import path from "node:path";
import type { RestLambdaDefinition } from "@cdk_lib/constructs/rest_lambda";

const __dirname = import.meta.dirname;

const cloudflareDefinition: RestLambdaDefinition = {
  entry: path.join(__dirname, "handler.ts"),
  restAPI: {
    "/v1/cloudflare": [{type: "POST", APIKeyRequired: false, requestSchema: null}],
  }
}

export default cloudflareDefinition;
