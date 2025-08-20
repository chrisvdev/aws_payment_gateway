import { SSMProvider } from "@aws-lambda-powertools/parameters/ssm"
import type { SSMClientConfig } from "@aws-sdk/client-ssm"
import { AWS_REGION } from "./environment.ts";

const clientConfig: SSMClientConfig = {
  region: AWS_REGION
};
export const ssm = new SSMProvider({
  clientConfig
});

export default function getParameter(parameterName: string) {
  return ssm.get(parameterName);
}