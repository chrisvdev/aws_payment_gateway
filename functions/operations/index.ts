import path from "node:path";
import type { RestLambdaDefinition } from "@cdk_lib/constructs/rest_lambda";

const __dirname = import.meta.dirname;

const operationsDefinition: RestLambdaDefinition = {
  entry: path.join(__dirname, "handler.ts"),
  restAPI: {
    "/v1/operations/products": [
      { type: "GET", APIKeyRequired: true, requestSchema: null },
    ],
    "/v1/operations/purchase": [
      { type: "GET", APIKeyRequired: true, requestSchema: null },
      { type: "POST", APIKeyRequired: true, requestSchema: null },
      { type: "PATCH", APIKeyRequired: true, requestSchema: null },
    ],
  },
};

export default operationsDefinition;
