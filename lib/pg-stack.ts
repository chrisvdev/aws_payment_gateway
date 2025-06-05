import { BaseStack, BaseStackProps } from "./constructs/base_stack";
import { Construct } from "constructs";
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

export class PGStack extends BaseStack {
  constructor(scope: Construct, id: string, props?: BaseStackProps) {
    super(scope, id, props);   

    const apiGateway = new ApiGateway(this, "PGApi", {
      restApiName: "pg_api",
      description: "Payment Gateway API",
      customDomain: {
        certificate: this.sslCertificate,
        hostedZone: this.route53HostedZone,
        subdomain: "pg-api",
      }
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
      customDomain: {
        certificate: this.sslCertificate,
        hostedZone: this.route53HostedZone,
        subdomain: "pg",
      }
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
