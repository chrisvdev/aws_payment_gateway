import { RemovalPolicy } from "aws-cdk-lib";
import {
  Bucket,
  BucketProps,
  BlockPublicAccess,
  BucketAccessControl,
} from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export class StaticS3Site extends Bucket {
  /**
   * Creates a new StaticS3Site instance, which represents an S3 bucket configured
   * to host a static website. The bucket has public read access, and both the
   * index and error documents are set to 'index.html'. The bucket and its objects
   * are set to be automatically deleted when the bucket is removed.
   *
   * @param scope The scope in which this resource is defined.
   * @param id The unique identifier for this resource.
   * @param props Additional bucket properties to customize the S3 bucket.
   */

  constructor(scope: Construct, id: string, props: BucketProps) {
    super(scope, id, {
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "index.html",
      publicReadAccess: true,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: new BlockPublicAccess({
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      }),
      ...props,
    });
  }
}
