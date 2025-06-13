import { BaseStack, type BaseStackProps } from "./constructs/base_stack.ts";
import * as constructs from "constructs";
import { PaymentProcessorLambda } from "./constructs/functions/payment_processor.ts";
import { CloudflareLambda } from "./constructs/functions/cloudflare.ts";
import { OperationsLambda } from "./constructs/functions/operations.ts";
import { ApiGateway } from "./constructs/api_gateway.ts";
import { StaticS3Site } from "./constructs/static_s3_site.ts";
import { WebDistribution } from "./constructs/web_distribution.ts";
import { ApiGatewayAuthorizer } from "./constructs/functions/apig_authorizer.ts";
/* 
import { Rule, Schedule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
 */

export class PGStack extends BaseStack {
  constructor(scope: constructs.Construct, id: string, props?: BaseStackProps) {
    super(scope, id, props);

    const apiGateway = new ApiGateway(this, "PGApi", {
      restApiName: "pg_api",
      description: "Payment Gateway API",
      customDomain: {
        certificate: this.sslCertificate,
        hostedZone: this.route53HostedZone,
        subdomain: "pg-api",
      },
    });

    apiGateway.lambdaAuthorizer = new ApiGatewayAuthorizer(
      this,
      "PGAuthorizer"
    );

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
      },
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
