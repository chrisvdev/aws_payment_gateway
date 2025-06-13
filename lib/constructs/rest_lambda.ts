import * as constructs from "constructs";
import { BaseLambda } from "./lambda.ts";
import { type ApiGateway } from "./api_gateway.ts";
import * as cdkLib from "aws-cdk-lib";
import { type RestAPI } from "./api_gateway.ts";

export type RestLambdaDefinition = { entry: string; restAPI: RestAPI };

type RestLambdaProps = cdkLib.aws_lambda_nodejs.NodejsFunctionProps & {
  apiGateway: ApiGateway;
  restAPI: RestAPI;
};

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
  constructor(
    scope: constructs.Construct,
    id: string,
    { apiGateway, restAPI, ...props }: RestLambdaProps
  ) {
    super(scope, id, {
      ...props,
      environment: {},
    });
    apiGateway.addLambdaIntegration(this, restAPI);
  }
}
