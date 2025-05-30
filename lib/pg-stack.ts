import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { PaymentProcessorLambda } from "./constructs/functions/payment_processor";
import { CloudflareLambda } from "./constructs/functions/cloudflare";
import { OperationsLambda } from "./constructs/functions/operations";
import { ApiGateway } from "./constructs/api_gateway";
import { StaticS3Site } from "./constructs/static_s3_site";
import { WebDistribution } from "./constructs/web_distribution";
/* 
import { Rule, Schedule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
 */

export class PGStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const certificate = Certificate.fromCertificateArn(
      this,
      "PGCert",
      "arn:aws:acm:us-east-1:807385937075:certificate/4f047a25-c2e5-42ec-8300-27035d5f76f3"
    );

    const apiGateway = new ApiGateway(this, "PGApi", {
      restApiName: "pg_api",
      description: "Payment Gateway API",
    });

    const staticSiteBucket = new StaticS3Site(this, "StaticSiteBucket", {});

    const cloudflareLambda = new CloudflareLambda(this, "CloudflareLambda", {
      apiGateway,
    });
    const operationsLambda = new OperationsLambda(this, "OperationsLambda", {
      apiGateway,
    });

    new WebDistribution(this, "PgWebDistribution", {
      bucket: staticSiteBucket,
      apiGateway,
      certificate,
      subdomain: "pg",
    });

    const paymentProcessorLambda = new PaymentProcessorLambda(
      this,
      "PaymentProcessorLambda",
      {}
    );
    // Descomentar al ir a producción
    /* 
    const rule = new Rule(this, "Rule", {
      schedule: Schedule.rate(Duration.hours(1)),
    });
    rule.addTarget(new LambdaFunction(paymentProcessorLambda));
     */
  }
}
