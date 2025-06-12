import { IdentitySource, RequestAuthorizer } from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { BaseLambda } from "./lambda";

export interface AuthorizerProps {
  lambdaEntry?:string
}

export class LambdaAuthorizer extends RequestAuthorizer {
  constructor(scope: Construct, id: string, props: AuthorizerProps) {
    const authorizerLambda = new BaseLambda(scope, `${id}-AuthorizerLambda`, {
      entry: props.lambdaEntry
    });
    super(scope, id, {
      ...props,
      handler: authorizerLambda,
      identitySources: [IdentitySource.header('x-pg-token')]
    });
  }
}