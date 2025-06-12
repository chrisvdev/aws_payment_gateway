import { aws_lambda_nodejs, Duration, RemovalPolicy,  } from "aws-cdk-lib";
import { Architecture, Runtime } from "aws-cdk-lib/aws-lambda";
import { RetentionDays, LogGroup } from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";
import { join } from "path";



export type LambdaDefinition = {
  entry: string;
};

type LambdaProps = aws_lambda_nodejs.NodejsFunctionProps;

export class BaseLambda extends aws_lambda_nodejs.NodejsFunction {
  /**
   * Constructor for the BaseLambda class.
   *
   * @param {Construct} scope - The scope of the construct.
   * @param {string} id - The id of the construct.
   * @param {LambdaProps} props - The properties of the construct.
   *
   * @see {@link https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda_nodejs-readme.html#customizing-aws-lambda-function}
   */
  constructor(scope: Construct, id: string, props: LambdaProps) {
    const {environment, ...rest} = props;
    const defaultProps: LambdaProps = {
      runtime: Runtime.NODEJS_22_X,
      architecture: Architecture.ARM_64,
      memorySize: 512,
      timeout: Duration.minutes(2),
      logRetention: RetentionDays.TWO_WEEKS,
      handler: "handler",
      // entry: "src/index.ts", para completar luego
      depsLockFilePath: join(import.meta.dirname, "../../functions/package-lock.json"),
      environment: {
        TZ: "America/Argentina/Buenos_Aires",
        ...environment
      },
      bundling: {
        // minify: true,
        externalModules: ["@aws-sdk/*"],
        target: "ESNext",
        logLevel: aws_lambda_nodejs.LogLevel.DEBUG,
        charset: aws_lambda_nodejs.Charset.UTF8,
        format: aws_lambda_nodejs.OutputFormat.ESM,
        mainFields: ["module", "main"],
        esbuildArgs:{
          "--tree-shaking": "true",
        },
        banner: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
      },
    };
    super(scope, id, {
      ...defaultProps,
      ...rest,
    });
    new LogGroup(this, `${id}-LogGroup`, {
      logGroupName: `/aws/lambda/${this.functionName}`,
      retention: RetentionDays.TWO_WEEKS,
      removalPolicy: RemovalPolicy.DESTROY
    });
  }
}
