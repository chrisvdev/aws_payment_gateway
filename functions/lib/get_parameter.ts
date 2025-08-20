import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import getEnvironmentVariable from "./environment.ts";

const ssmClient = new SSMClient({ region: getEnvironmentVariable("AWS_REGION") });

export default function getParameter(parameterName: string) {
  const command = new GetParameterCommand({
    Name: parameterName,
    WithDecryption: true,
  });
  return ssmClient.send(command);
}
