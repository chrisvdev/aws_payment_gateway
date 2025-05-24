import path from "node:path";
import type { RestLambdaDefinition } from "@cdk_lib/constructs/rest_lambda";

const __dirname = import.meta.dirname;

const operationsDefinition: RestLambdaDefinition = {
  entry: path.join(__dirname, "handler.ts"),
  restAPI: {
    "/v1/operations/products": [
      { type: "GET", APIKeyRequired: true, schema: null },
    ],
    "/v1/operations/purchase": [
      { type: "GET", APIKeyRequired: true, schema: null },
      { type: "POST", APIKeyRequired: true, schema: null },
      { type: "PATCH", APIKeyRequired: true, schema: null },
    ],
  },
};

export default operationsDefinition;
