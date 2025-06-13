import {
  APIGatewayRequestAuthorizerEvent,
  APIGatewayAuthorizerResult,
  APIGatewayRequestAuthorizerHandler,
} from "aws-lambda";

export const handler: APIGatewayRequestAuthorizerHandler = async (
  event: APIGatewayRequestAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
  console.log("event", JSON.stringify(event));
  const token = event.headers?.["x-pg-token"];
  if (token === "allow") {
    return generatePolicy("user", "Allow", event.methodArn);
  }

  const result = generatePolicy("user", "Deny", event.methodArn);

  return result;
};

function generatePolicy(
  principalId: string,
  effect: "Allow" | "Deny",
  resource: string
): APIGatewayAuthorizerResult {
  const baseARN = resource.split("/")[0];
  return {
    principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: `${baseARN}/prod/*`,
        },
      ],
    },
  };
}
