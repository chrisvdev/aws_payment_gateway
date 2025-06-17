import * as constructs from "constructs";
import * as ssm from "aws-cdk-lib/aws-ssm";

export class ParameterStore extends constructs.Construct {
  private appId: string;
  constructor(scope: constructs.Construct, id: string) {
    super(scope, id);
    this.appId = scope.node.id;
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
}
