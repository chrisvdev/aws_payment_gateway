import path from "node:path";
import type { RestLambdaDefinition } from "../../lib/constructs/rest_lambda.ts";
import { routes } from "./routes.ts";

const __dirname = import.meta.dirname;

const operationsDefinition: RestLambdaDefinition = {
  entry: path.join(__dirname, "handler.ts"),
  restAPI: routes,
};

export default operationsDefinition;
