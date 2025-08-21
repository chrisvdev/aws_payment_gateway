import { Construct } from "constructs";
import cloudflareDefinition from "../../../functions/cloudflare/index.ts";
import { type ApiGateway } from "../api_gateway.ts";
import { RestLambda } from "../rest_lambda.ts";
import { ParameterStore } from "../parameter_store.ts";
// import * as lambda from 'aws-cdk-lib/aws-lambda'

type CloudflareLambdaProps = {
  apiGateway: ApiGateway
  parameterStore: ParameterStore
};

export class CloudflareLambda extends RestLambda {
  /**
   * Constructs a new instance of the CloudflareLambda class.
   *
   * @param scope - The scope in which this construct is defined.
   * @param id - The identifier for this construct.
   * @param props - The properties for the CloudflareLambda, including the API gateway.
   */

  constructor(
    scope: Construct,
    id: string,
    { apiGateway, parameterStore }: CloudflareLambdaProps) {
    super(scope, id, {
      entry: cloudflareDefinition.entry,
      apiGateway,
      restAPI: cloudflareDefinition.restAPI,
      environment: {
      },
    });
    parameterStore.grantReadEnvironmentVariable(this, "CLOUDFLARE_SECRET_KEY")
  }
}
