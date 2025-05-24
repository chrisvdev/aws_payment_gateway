import { Construct } from "constructs";
import { BaseLambda } from "@cdk_constructs/lambda";
import { type ApiGateway } from "@cdk_constructs/api_gateway";
import { aws_lambda_nodejs } from "aws-cdk-lib";
import { RestAPI } from "@cdk_constructs/api_gateway";

export type RestLambdaDefinition = { entry: string, restAPI: RestAPI }

type RestLambdaProps = aws_lambda_nodejs.NodejsFunctionProps & { apiGateway: ApiGateway, restAPI: RestAPI };

export class RestLambda extends BaseLambda {
  /**
   * Creates a new RestLambda instance. This includes the AWS Lambda function
   * with a Node.js 22 runtime and the integration with the given ApiGateway.
   * The environment variables of the lambda function are set as empty.
   *
   * @param scope The scope to create the RestLambda in.
   * @param id The ID of the RestLambda.
   * @param props The properties of the RestLambda, such as the entry point of
   *   the lambda function, the ApiGateway to integrate with, and the RestAPI
   *   to add the lambda function to.
   */
  constructor(scope: Construct, id: string, { apiGateway, restAPI, ...props }: RestLambdaProps) {
    super(scope, id, {
      ...props,
      environment: {
      },
    });
    apiGateway.addLambdaIntegration(this,restAPI);
  }
}