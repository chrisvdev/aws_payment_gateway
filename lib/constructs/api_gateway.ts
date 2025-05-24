import { aws_apigateway, RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53Targets from "aws-cdk-lib/aws-route53-targets";
import * as certificateManager from "aws-cdk-lib/aws-certificatemanager";
import * as logs from "aws-cdk-lib/aws-logs";
import { type IFunction } from "aws-cdk-lib/aws-lambda";
import { JsonSchema, JsonSchemaType } from "aws-cdk-lib/aws-apigateway";

export type ApiGatewayProps = aws_apigateway.RestApiProps;
type HTTPMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type Method = {
  type: HTTPMethod;
  APIKeyRequired?: boolean;
  schema?: JsonSchema | null;
};

export type Methods = Method[];

export type Path = string;

export type RestAPI = Record<Path, Methods>;

const baseDomain = "cloud.chrisvdev.com";
const subdomain = "test-api";

export class ApiGateway extends aws_apigateway.RestApi {  
  /**
   * Constructor for ApiGateway.
   *
   * Creates a new ApiGateway instance and sets up an access log group and
   * a usage plan for the API.
   *
   * @param scope The scope to create the ApiGateway in.
   * @param id The ID of the ApiGateway.
   * @param props The properties of the ApiGateway, such as the API name and
   *   description.
   */
  constructor(scope: Construct, id: string, props: ApiGatewayProps) {
    const logGroup = new logs.LogGroup(scope, `${id}-ApiGatewayAccessLogs`, {
      logGroupName: `/aws/apigateway/${id}-ApiGatewayAccessLogs`,
      removalPolicy: RemovalPolicy.DESTROY, // útil para desarrollo
      retention: logs.RetentionDays.TWO_WEEKS,
    });
    super(scope, id, {
      ...props,
      deployOptions: {
        accessLogDestination: new aws_apigateway.LogGroupLogDestination(
          logGroup
        ),
        accessLogFormat: aws_apigateway.AccessLogFormat.jsonWithStandardFields({
          caller: true,
          httpMethod: true,
          ip: true,
          protocol: true,
          requestTime: true,
          resourcePath: true,
          responseLength: true,
          status: true,
          user: true,
        }),
      },
      cloudWatchRole: true,
    });
    const apiKey = this.addApiKey(`${id}-api-key`);
    const usagePlan = new aws_apigateway.UsagePlan(this, `${id}-usage-plan`, {
      apiStages: [
        {
          api: this,
          stage: this.deploymentStage,
        },
      ],
    });
    usagePlan.addApiKey(apiKey);
  }

  /**
   * Adds a lambda function as an integration to the API with the given
   * RestAPI. The RestAPI is an object where the keys are paths and the values
   * are arrays of methods. Each method is an object with the following
   * properties:
   * - type: the HTTP method for the resource
   * - APIKeyRequired: whether the API key is required for the resource
   * - schema: the schema for the request body, if any
   * @param lambda the lambda function to add as an integration
   * @param RestAPI the RestAPI to add the lambda function to
   */
  addLambdaIntegration(lambda: IFunction, RestAPI: RestAPI) {
    for (const [path, methods] of Object.entries(RestAPI)) {
      const resource = this.root.resourceForPath(path);
      for (const method of methods) {
        resource.addMethod(
          method.type,
          new aws_apigateway.LambdaIntegration(lambda, { proxy: true }),
          {
            apiKeyRequired: method.APIKeyRequired ? true : false,
            requestModels: {
              "application/json": method.schema
                ? this.addModel(
                    `${path
                      .split("/")
                      .map((e) => e.charAt(0).toUpperCase() + e.slice(1))
                      .join("")}${
                      method.type.charAt(0).toUpperCase() + method.type.slice(1)
                    }`.slice(-50),
                    {
                      schema: method.schema,
                    }
                  )
                : aws_apigateway.Model.EMPTY_MODEL,
            },
          }
        );
      }
    }
  }
}
