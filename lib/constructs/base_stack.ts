import * as cdkLib from "aws-cdk-lib";
import * as constructs from "constructs";
import * as certificateManager from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";

export interface BaseStackProps extends cdkLib.StackProps {}

export class BaseStack extends cdkLib.Stack {
  sslCertificate: certificateManager.ICertificate;
  route53HostedZone: route53.IHostedZone;
  readonly baseDomain = "cloud.chrisvdev.com";
  /**
   * Initializes a new instance of the BaseStack class.
   *
   * @param scope - The scope within which this construct is defined.
   * @param id - The unique identifier for this construct.
   * @param props - Optional properties for the base stack.
   *
   * This constructor sets up the SSL certificate and Route 53 hosted zone for the base domain.
   */

  constructor(scope: constructs.Construct, id: string, props?: BaseStackProps) {
    super(scope, id, props);
    this.sslCertificate = certificateManager.Certificate.fromCertificateArn(
      this,
      "PGCert",
      "arn:aws:acm:us-east-1:807385937075:certificate/4f047a25-c2e5-42ec-8300-27035d5f76f3"
    );
    this.route53HostedZone = route53.HostedZone.fromLookup(this, "HostedZone", {
      domainName: this.baseDomain,
    });
  }
}
