import * as cdkLib from "aws-cdk-lib";
import * as constructs from "constructs";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as certificateManager from "aws-cdk-lib/aws-certificatemanager";
import * as logs from "aws-cdk-lib/aws-logs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";
import * as route53Targets from "aws-cdk-lib/aws-route53-targets";
import { LambdaAuthorizer } from "./lambda_apigateway_authorizer.ts";

export interface ApiGatewayProps extends cdkLib.aws_apigateway.RestApiProps {
  customDomain?: {
    certificate: certificateManager.ICertificate;
    hostedZone: route53.IHostedZone;
    subdomain: string;
  };
}

type HTTPMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type Method = {
  type: HTTPMethod;
  APIKeyRequired?: boolean;
  authorizer?: boolean;
  requestSchema?: apigateway.JsonSchema | null;
  responseSchema?: apigateway.JsonSchema | null;
};

export type Methods = Method[];

export type Path = string;

export type RestAPI = Record<Path, Methods>;

export class ApiGateway extends cdkLib.aws_apigateway.RestApi {
  readonly requestValidatorBody: cdkLib.aws_apigateway.RequestValidator;
  readonly requestValidatorParams: cdkLib.aws_apigateway.RequestValidator;
  private badRequestErrorListDTO: apigateway.Model;
  private errorDTO: apigateway.Model;
  private authorizer: LambdaAuthorizer | null = null;
  private api: RestAPI = {};
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
  constructor(scope: constructs.Construct, id: string, props: ApiGatewayProps) {
    const logGroup = new logs.LogGroup(scope, `${id}-ApiGatewayAccessLogs`, {
      logGroupName: `/aws/apigateway/${id}-ApiGatewayAccessLogs`,
      removalPolicy: cdkLib.RemovalPolicy.DESTROY, // útil para desarrollo
      retention: logs.RetentionDays.TWO_WEEKS,
    });
    super(scope, id, {
      ...props,
      deployOptions: {
        accessLogDestination: new cdkLib.aws_apigateway.LogGroupLogDestination(
          logGroup
        ),
        accessLogFormat:
          cdkLib.aws_apigateway.AccessLogFormat.jsonWithStandardFields({
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
    const usagePlan = new cdkLib.aws_apigateway.UsagePlan(
      this,
      `${id}-usage-plan`,
      {
        apiStages: [
          {
            api: this,
            stage: this.deploymentStage,
          },
        ],
      }
    );
    usagePlan.addApiKey(apiKey);

    this.badRequestErrorListDTO = this.addModel("BadRequestErrorListDTO", {
      contentType: "application/json",
      schema: {
        type: apigateway.JsonSchemaType.OBJECT,
        properties: {
          errors: {
            type: apigateway.JsonSchemaType.ARRAY,
            items: {
              type: apigateway.JsonSchemaType.OBJECT,
              properties: {
                code: {
                  type: apigateway.JsonSchemaType.STRING,
                },
                message: {
                  type: apigateway.JsonSchemaType.STRING,
                },
              },
            },
          },
        },
      },
    });

    this.errorDTO = this.addModel("ErrorDTO", {
      contentType: "application/json",
      schema: {
        type: apigateway.JsonSchemaType.OBJECT,
        properties: {
          code: {
            type: apigateway.JsonSchemaType.STRING,
          },
          message: {
            type: apigateway.JsonSchemaType.STRING,
          },
        },
      },
    });
    this.requestValidatorBody = this.addRequestValidator(
      `${id}-request-validator-body`,
      {
        validateRequestBody: true,
        validateRequestParameters: false,
      }
    );
    this.requestValidatorParams = this.addRequestValidator(
      `${id}-request-validator-params`,
      {
        validateRequestBody: false,
        validateRequestParameters: true,
      }
    );

    if (props.customDomain) {
      const customDomain = `${props.customDomain.subdomain}.${props.customDomain.hostedZone.zoneName}`;
      this.addDomainName(`${id}-custom-domain`, {
        domainName: customDomain,
        certificate: props.customDomain.certificate,
      });
      new route53.ARecord(scope, `${id}-custom-domain-a-record`, {
        zone: props.customDomain.hostedZone,
        recordName: props.customDomain.subdomain,
        target: route53.RecordTarget.fromAlias(
          new route53Targets.ApiGateway(this)
        ),
      });
      new cdkLib.CfnOutput(this, `${id}-ApiGatewayCustomURL`, {
        value: `https://${customDomain}`,
      });
    }
  }

  set lambdaAuthorizer(lambdaAuthorizer: LambdaAuthorizer) {
    this.authorizer = lambdaAuthorizer;
  }

  get restAPI(): RestAPI {
    return this.api;
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
  addLambdaIntegration(lambda: lambda.IFunction, RestAPI: RestAPI) {
    Object.assign(this.api, RestAPI);
    lambda.addPermission(`${lambda.node.id}-Invoke`, {
      principal: new iam.ServicePrincipal("apigateway.amazonaws.com"),
      sourceArn: this.arnForExecuteApi(),
      action: "lambda:InvokeFunction",
    });
    const responseParameters = {
      "method.response.header.Access-Control-Allow-Headers": true,
      "method.response.header.Access-Control-Allow-Methods": true,
      "method.response.header.Access-Control-Allow-Origin": true,
    };
    for (const [path, methods] of Object.entries(RestAPI)) {
      const resource = this.root.resourceForPath(path);
      resource.addCorsPreflight({
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          "Content-Type",
          "Authorization",
          "X-Amz-Date",
          "X-Amz-Security-Token",
          "X-Amz-User-Agent",
          "X-Api-Key",
          "x-pg-token",
        ],
        allowCredentials: true,
      });
      for (const method of methods) {
        resource.addMethod(
          method.type,
          new cdkLib.aws_apigateway.LambdaIntegration(lambda, { proxy: true }),
          {
            apiKeyRequired: method.APIKeyRequired ? true : false,
            authorizer:
              this.authorizer && method.authorizer
                ? this.authorizer
                : undefined,
            requestValidator: method.requestSchema
              ? method.type === "GET"
                ? this.requestValidatorParams
                : this.requestValidatorBody
              : undefined,
            requestModels: {
              "application/json": method.requestSchema
                ? this.addModel(
                    `${path
                      .split("/")
                      .map((e) => e.charAt(0).toUpperCase() + e.slice(1))
                      .join("")}${
                      method.type.charAt(0).toUpperCase() + method.type.slice(1)
                    }`.slice(-50),
                    {
                      schema: method.requestSchema,
                    }
                  )
                : cdkLib.aws_apigateway.Model.EMPTY_MODEL,
            },
            methodResponses: [
              {
                statusCode: "200",
                responseParameters,
                responseModels: {
                  "application/json": method.responseSchema
                    ? this.addModel(
                        `${path
                          .split("/")
                          .map((e) => e.charAt(0).toUpperCase() + e.slice(1))
                          .join("")}${
                          method.type.charAt(0).toUpperCase() +
                          method.type.slice(1)
                        }`.slice(-50),
                        {
                          schema: method.responseSchema,
                        }
                      )
                    : cdkLib.aws_apigateway.Model.EMPTY_MODEL,
                },
              },
              {
                statusCode: "400",
                responseParameters,
                responseModels: {
                  "application/json": this.badRequestErrorListDTO,
                },
              },
              {
                statusCode: "403",
                responseParameters,
                responseModels: {
                  "application/json": this.errorDTO,
                },
              },
              {
                statusCode: "409",
                responseParameters,
                responseModels: {
                  "application/json": this.errorDTO,
                },
              },
            ],
          }
        );
      }
    }
  }
}
