import path from "node:path";
import { type LambdaDefinition } from "../../lib/constructs/lambda.ts";

const __dirname = import.meta.dirname;

const lambadAuthorizerDefinition: LambdaDefinition = {
  entry: path.join(__dirname, "handler.ts"),
};


export default lambadAuthorizerDefinition;
