import * as cdkLib from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as logs from "aws-cdk-lib/aws-logs";
import * as constructs from "constructs";
import { join } from "path";

export type LambdaDefinition = {
  entry: string;
};

type LambdaProps = cdkLib.aws_lambda_nodejs.NodejsFunctionProps;

export class BaseLambda extends cdkLib.aws_lambda_nodejs.NodejsFunction {
  /**
   * Constructor for the BaseLambda class.
   *
   * @param {Construct} scope - The scope of the construct.
   * @param {string} id - The id of the construct.
   * @param {LambdaProps} props - The properties of the construct.
   *
   * @see {@link https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda_nodejs-readme.html#customizing-aws-lambda-function}
   */
  constructor(scope: constructs.Construct, id: string, props: LambdaProps) {
    const { environment, ...rest } = props;
    const defaultProps: LambdaProps = {
      runtime: lambda.Runtime.NODEJS_22_X,
      architecture: lambda.Architecture.ARM_64,
      memorySize: 512,
      timeout: cdkLib.Duration.minutes(2),
      logRetention: logs.RetentionDays.TWO_WEEKS,
      handler: "handler",
      // entry: "src/index.ts", para completar luego
      depsLockFilePath: join(
        import.meta.dirname,
        "../../functions/package-lock.json"
      ),
      environment: {
        TZ: "America/Argentina/Buenos_Aires",
        ...environment,
      },
      bundling: {
        // minify: true,
        externalModules: ["@aws-sdk/*"],
        target: "ESNext",
        logLevel: cdkLib.aws_lambda_nodejs.LogLevel.DEBUG,
        charset: cdkLib.aws_lambda_nodejs.Charset.UTF8,
        format: cdkLib.aws_lambda_nodejs.OutputFormat.ESM,
        mainFields: ["module", "main"],
        esbuildArgs: {
          "--tree-shaking": "true",
        },
        banner:
          "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
      },
    };
    super(scope, id, {
      ...defaultProps,
      ...rest,
    });
    new logs.LogGroup(this, `${id}-LogGroup`, {
      logGroupName: `/aws/lambda/${this.functionName}`,
      retention: logs.RetentionDays.TWO_WEEKS,
      removalPolicy: cdkLib.RemovalPolicy.DESTROY,
    });
  }
}
