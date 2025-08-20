import type { RestAPI } from "../../lib/constructs/api_gateway.ts";

export const routes = {
  "/api/v1/operations/products":
  {
    "GET": { authorizer: true, requestSchema: null }
  },
  "/api/v1/operations/purchase": {
    "GET": { authorizer: true, requestSchema: null },
    "POST": { authorizer: true, requestSchema: null },
    "PATCH": { authorizer: true, requestSchema: null },
  },
} satisfies RestAPI;