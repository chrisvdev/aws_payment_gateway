import { Construct } from "constructs";
import cloudflareDefinition from "../../../functions/cloudflare/index.ts";
import { type ApiGateway } from "../api_gateway.ts";
import { RestLambda } from "../rest_lambda.ts";
// import * as lambda from 'aws-cdk-lib/aws-lambda'

type CloudflareLambdaProps = { apiGateway: ApiGateway };

export class CloudflareLambda extends RestLambda {
/**
 * Constructs a new instance of the CloudflareLambda class.
 *
 * @param scope - The scope in which this construct is defined.
 * @param id - The identifier for this construct.
 * @param props - The properties for the CloudflareLambda, including the API gateway.
 */

  constructor(scope: Construct, id: string, props: CloudflareLambdaProps) {
    super(scope, id, {
      entry: cloudflareDefinition.entry,
      apiGateway: props.apiGateway,
      restAPI: cloudflareDefinition.restAPI,
      environment: {
      },
    });
  }
}
