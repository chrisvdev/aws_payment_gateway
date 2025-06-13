import * as constructs from "constructs";
import { RestLambda } from "../rest_lambda.ts";
import operationsDefinition from "../../../functions/operations/index.ts";
import { type ApiGateway } from "../api_gateway.ts";
// import * as lambda from 'aws-cdk-lib/aws-lambda'

type OperationsLambdaProps = { apiGateway: ApiGateway };

export class OperationsLambda extends RestLambda {
  /**
   * Creates a new OperationsLambda instance.
   *
   * @param scope The scope to create the OperationsLambda in.
   * @param id The ID of the OperationsLambda.
   * @param props The properties of the OperationsLambda, such as the API Gateway it
   *   belongs to.
   */
  constructor(
    scope: constructs.Construct,
    id: string,
    props: OperationsLambdaProps
  ) {
    super(scope, id, {
      entry: operationsDefinition.entry,
      apiGateway: props.apiGateway,
      restAPI: operationsDefinition.restAPI,
      environment: {},
    });
  }
}
