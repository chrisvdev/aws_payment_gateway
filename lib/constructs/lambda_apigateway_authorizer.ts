import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as constructs from "constructs";
import { BaseLambda } from "./lambda.ts";
import * as cdkLib from "aws-cdk-lib";

export interface AuthorizerProps {
  lambdaEntry?: string;
}

export class LambdaAuthorizer extends apigateway.RequestAuthorizer {
  /**
   * Creates a new LambdaAuthorizer instance.
   *
   * @param scope The scope to create the LambdaAuthorizer in.
   * @param id The ID of the LambdaAuthorizer.
   * @param props The properties of the LambdaAuthorizer, such as the path to the
   *   lambda entry point.
   *
   * @remarks
   * The authorizer will be configured to use the header "x-pg-token" as the
   * identity source, and will cache the authorizer result for 5 minutes.
   */
  constructor(scope: constructs.Construct, id: string, props: AuthorizerProps) {
    const authorizerLambda = new BaseLambda(scope, `${id}-AuthorizerLambda`, {
      entry: props.lambdaEntry,
    });
    super(scope, id, {
      ...props,
      handler: authorizerLambda,
      identitySources: [apigateway.IdentitySource.header("x-pg-token")],
      resultsCacheTtl: cdkLib.Duration.seconds(300),
    });
  }
}
