import * as cdkLib from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cloudfrontOrigins from "aws-cdk-lib/aws-cloudfront-origins";
import * as certificateManager from "aws-cdk-lib/aws-certificatemanager";
import * as s3Deployment from "aws-cdk-lib/aws-s3-deployment";
import * as constructs from "constructs";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53Targets from "aws-cdk-lib/aws-route53-targets";
import { type ApiGateway } from "./api_gateway.ts";

interface WebDistributionProps extends cdkLib.StackProps {
  bucket: s3.Bucket;
  apiGateway: ApiGateway;
  customDomain: {
    certificate: certificateManager.ICertificate;
    hostedZone: route53.IHostedZone;
    subdomain: string;
  };
}

const baseDomain = "cloud.chrisvdev.com";

export class WebDistribution extends constructs.Construct {
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
  constructor(
    scope: constructs.Construct,
    id: string,
    props: WebDistributionProps
  ) {
    super(scope, id);

    const {
      bucket,
      apiGateway,
      customDomain: { certificate, hostedZone, subdomain },
    } = props;

    const loggingBucket = new s3.Bucket(this, `${id}-CloudFrontLogsBucket`, {
      removalPolicy: cdkLib.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      accessControl: s3.BucketAccessControl.LOG_DELIVERY_WRITE,
    });

    loggingBucket.addLifecycleRule({
      enabled: true,
      expiration: cdkLib.Duration.days(30),
      transitions: [
        {
          storageClass: s3.StorageClass.INTELLIGENT_TIERING,
          transitionAfter: cdkLib.Duration.days(7),
        },
      ],
    });

    const additionalBehaviors: Record<string, cloudfront.BehaviorOptions> = {};
    const apiGatewayDomain = cdkLib.Fn.select(
      2,
      cdkLib.Fn.split("/", apiGateway.url)
    );
    const apiGatewayStage = cdkLib.Fn.select(
      3,
      cdkLib.Fn.split("/", apiGateway.url)
    );
    /* const originRequestPolicy = new cloudfront.OriginRequestPolicy(
      this,
      "APIOriginRequestPolicy",
      {
        originRequestPolicyName: "APIOriginRequestPolicy",
        cookieBehavior: cloudfront.OriginRequestCookieBehavior.all(),
        queryStringBehavior: cloudfront.OriginRequestQueryStringBehavior.all(),
        headerBehavior: cloudfront.OriginRequestHeaderBehavior.allowList(
          "Content-Type",
          "Accept",
          "User-Agent",
          "x-pg-token"
        ),
        comment: "Origin request policy for API Gateway",
      }
    ); */
    /* const cachePolicy = new cloudfront.CachePolicy
    (
      this,
      "APIOriginCachePolicy",
      {
        cachePolicyName: "APIOriginCachePolicy",
        comment: "Cache policy for API Gateway",
        defaultTtl: cdkLib.Duration.seconds(0),
        minTtl: cdkLib.Duration.seconds(0),
        maxTtl: cdkLib.Duration.seconds(0),
        headerBehavior: cloudfront.CacheHeaderBehavior.none(),
        /* .allowList(
          "Content-Type",
          "Accept",
          "User-Agent",
          "x-pg-token"
        ), 
        enableAcceptEncodingBrotli: true,
        enableAcceptEncodingGzip: true,*/ /*
      }
    ) */

    // API Gateway REST API behavior
    Object.entries(apiGateway.restAPI).forEach(([path, methods]) => {
      additionalBehaviors[path] = {
        origin: new cloudfrontOrigins.HttpOrigin(apiGatewayDomain, {
          originPath: `/${apiGatewayStage}`,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
        originRequestPolicy:
          cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
        responseHeadersPolicy:
          cloudfront.ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        compress: true,
      };
    });

    // S3 Static Website behavior
    const defaultBehavior: cloudfront.BehaviorOptions = {
      origin: new cloudfrontOrigins.HttpOrigin(bucket.bucketWebsiteDomainName, {
        protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
      }),
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
      compress: true,
    };

    // Create CloudFront distribution
    const distribution = new cloudfront.Distribution(this, "WebDistribution", {
      logBucket: loggingBucket,
      logFilePrefix: "cloudfront-logs/",
      defaultBehavior,
      additionalBehaviors,
      domainNames: [`${subdomain}.${baseDomain}`],
      certificate: certificate,
      comment: `Web distribution for ${subdomain}.${baseDomain}`,
    });

    new route53.ARecord(this, "PgAliasRecord", {
      zone: hostedZone,
      recordName: subdomain,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.CloudFrontTarget(distribution)
      ),
    });

    // Deploy static content to S3 bucket
    new s3Deployment.BucketDeployment(this, "DeployStaticWebsite", {
      sources: [s3Deployment.Source.asset("./frontend/dist")],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ["/*"],
    });

    // Output CloudFront URLs
    new cdkLib.CfnOutput(this, "CloudFrontURL", {
      value: `https://${distribution.domainName}`,
    });
    new cdkLib.CfnOutput(this, "CloudFrontAliasURL", {
      value: `https://${subdomain}.${baseDomain}`,
    });
  }
}
