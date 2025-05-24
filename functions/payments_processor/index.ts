import path from "node:path";
import { type LambdaDefinition } from "@cdk_lib/constructs/lambda";

const __dirname = import.meta.dirname;

const paymentProcessorDefinition: LambdaDefinition = {
  entry: path.join(__dirname, "handler.ts"),
};


export default paymentProcessorDefinition;
