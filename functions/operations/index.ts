import path from "node:path";
import type { RestLambdaDefinition } from "../../lib/constructs/rest_lambda.ts";

const __dirname = import.meta.dirname;

const operationsDefinition: RestLambdaDefinition = {
  entry: path.join(__dirname, "handler.ts"),
  restAPI: {
    "/api/v1/operations/products": [
      { type: "GET", authorizer: true, requestSchema: null },
    ],
    "/api/v1/operations/purchase": [
      { type: "GET", authorizer: true, requestSchema: null },
      { type: "POST", authorizer: true, requestSchema: null },
      { type: "PATCH", authorizer: true, requestSchema: null },
    ],
  },
};

export default operationsDefinition;
