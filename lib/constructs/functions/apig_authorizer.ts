import { Construct } from "constructs";
import {
  LambdaAuthorizer,
} from "../lambda_apigateway_authorizer";
import { ResourceProps } from "aws-cdk-lib";
import lambadAuthorizerDefinition from "@functions/lambda_authorizer";

export class ApiGatewayAuthorizer extends LambdaAuthorizer {
  constructor(scope: Construct, id: string) {
    super(scope, id, {
      lambdaEntry: lambadAuthorizerDefinition.entry,
    });
  }
}
