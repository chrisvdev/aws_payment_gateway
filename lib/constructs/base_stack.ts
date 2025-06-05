import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Certificate, ICertificate } from "aws-cdk-lib/aws-certificatemanager";
import { HostedZone, IHostedZone } from "aws-cdk-lib/aws-route53";

export interface BaseStackProps extends StackProps {}

export class BaseStack extends Stack {
  sslCertificate: ICertificate;
  route53HostedZone: IHostedZone;
  readonly baseDomain = "cloud.chrisvdev.com";
  constructor(scope: Construct, id: string, props?: BaseStackProps) {
    super(scope, id, props);
    this.sslCertificate = Certificate.fromCertificateArn(
      this,
      "PGCert",
      "arn:aws:acm:us-east-1:807385937075:certificate/4f047a25-c2e5-42ec-8300-27035d5f76f3"
    );
    this.route53HostedZone = HostedZone.fromLookup(this, "HostedZone", {
      domainName: this.baseDomain,
    });
  }
}
