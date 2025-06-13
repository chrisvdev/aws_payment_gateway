import * as constructs from "constructs";
import { LambdaAuthorizer } from "../lambda_apigateway_authorizer.ts";
import lambadAuthorizerDefinition from "../../../functions/lambda_authorizer/index.ts";

export class ApiGatewayAuthorizer extends LambdaAuthorizer {
  constructor(scope: constructs.Construct, id: string) {
    super(scope, id, {
      lambdaEntry: lambadAuthorizerDefinition.entry,
    });
  }
}
