import * as cdkLib from "aws-cdk-lib";
import * as constructs from "constructs";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as iam from "aws-cdk-lib/aws-iam";
import environment, { type EnvironmentVariables } from "../../utils/environment.ts";

export type ParameterStoreProps = {
  loadEnv?: boolean;
};

export class ParameterStore extends constructs.Construct {
  private appId: string;
  constructor(scope: constructs.Construct, id: string, { loadEnv }: ParameterStoreProps) {
    super(scope, id);
    this.appId = scope.node.id;
    if (loadEnv) this.loadEnvironmentVariables(environment);
  }
  public loadParameter(
    parameterName: string,
    parameterValue: string,
    description?: string
  ) {
    return new ssm.StringParameter(this, `${this.appId}-${parameterName}`, {
      parameterName: `/${this.appId}/${parameterName}`,
      stringValue: parameterValue,
      description,
      tier: ssm.ParameterTier.STANDARD,
    });
  }
  public loadParameters(parameters: { [key: string]: string }) {
    for (const [parameterName, parameterValue] of Object.entries(parameters)) {
      this.loadParameter(parameterName, parameterValue);
    }
  }
  private loadEnvironmentVariables(env: EnvironmentVariables) {
    for (const [key, value] of Object.entries(env)) {
      this.loadParameter(key, value);
    }
  }
  public grantReadEnvironmentVariable(
    grantee: cdkLib.aws_lambda_nodejs.NodejsFunction,
    variableName: keyof EnvironmentVariables
  ) {
    grantee.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["ssm:GetParameter"],
        resources: [
          `arn:${grantee.stack.partition}:ssm:${grantee.stack.region}:${grantee.stack.account}:parameter/${this.appId}/${variableName}`,
        ],
      }),
    )
  }
  public grantRead(
    grantee: cdkLib.aws_lambda_nodejs.NodejsFunction,
    parameter: string
  ) {
    grantee.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["ssm:GetParameter"],
        resources: [
          `arn:${grantee.stack.partition}:ssm:${grantee.stack.region}:${grantee.stack.account}:parameter/${this.appId}/${parameter}`,
        ],
      }),
    )
  }
}
