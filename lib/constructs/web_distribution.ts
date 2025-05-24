import { StackProps, Aws } from "aws-cdk-lib";
import { type Bucket } from "aws-cdk-lib/aws-s3";
import {
  Distribution,
  ViewerProtocolPolicy,
  CachePolicy,
  AllowedMethods,
} from "aws-cdk-lib/aws-cloudfront";
import { HttpOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import { type ICertificate } from "aws-cdk-lib/aws-certificatemanager";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { type RestApi } from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { HostedZone, ARecord, RecordTarget } from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import { S3BucketOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import { PolicyStatement, ServicePrincipal } from "aws-cdk-lib/aws-iam";

interface WebDistributionProps extends StackProps {
  bucket: Bucket;
  apiGateway: RestApi;
  certificate: ICertificate;
  subdomain: string;
}

const baseDomain = "cloud.chrisvdev.com";

export class WebDistribution extends Construct {
  /**
   * Creates a new WebDistribution instance.
   *
   * This construct creates a CloudFront distribution that serves a static website
   * from the given S3 bucket and an API Gateway REST API. It also creates an
   * alias record in a Route 53 hosted zone and deploys the static website to the
   * S3 bucket.
   *
   * @param scope The scope to create the WebDistribution in.
   * @param id The ID of the WebDistribution.
   * @param props The properties of the WebDistribution, such as the S3 bucket
   *   to serve, the API Gateway REST API to integrate with, the SSL/TLS
   *   certificate to use, and the subdomain to use for the alias record.
   */
  constructor(scope: Construct, id: string, props: WebDistributionProps) {
    super(scope, id);

    const { bucket, apiGateway, certificate, subdomain } = props;

    // Create CloudFront distribution
    const distribution = new Distribution(this, "WebDistribution", {
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: CachePolicy.CACHING_OPTIMIZED,
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        compress: true,
      },
      additionalBehaviors: {
        "/api/*": {
          origin: new HttpOrigin(
            `${apiGateway.restApiId}.execute-api.${Aws.REGION}.amazonaws.com`,
            {
              originPath: `/${apiGateway.deploymentStage.stageName}`,
            }
          ),
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: CachePolicy.CACHING_DISABLED,
          allowedMethods: AllowedMethods.ALLOW_ALL,
          compress: true,
        },
      },
      domainNames: [`${subdomain}.${baseDomain}`],
      certificate: certificate,
    });

    const hostedZone = HostedZone.fromLookup(this, "HostedZone", {
      domainName: baseDomain,
    });

    new ARecord(this, "PgAliasRecord", {
      zone: hostedZone,
      recordName: subdomain,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
    });

    // Deploy static content to S3 bucket
    new BucketDeployment(this, "DeployStaticWebsite", {
      sources: [Source.asset("./frontend/dist")],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ["/*"],
    });

    bucket.addToResourcePolicy(
      new PolicyStatement({
        actions: ["s3:GetObject"],
        resources: [`${bucket.bucketArn}/*`],
        principals: [new ServicePrincipal("cloudfront.amazonaws.com")],
        conditions: {
          StringEquals: {
            "AWS:SourceArn": `arn:aws:cloudfront::${Aws.ACCOUNT_ID}:distribution/${distribution.distributionId}`,
          },
        },
      })
    );
  }
}
