import { Construct } from "constructs";
import { BaseLambda } from "@cdk_constructs/lambda";
import paymentProcessorDefinition from "@functions/payments_processor";
// import * as lambda from 'aws-cdk-lib/aws-lambda'

type PaymentProcessorLambdaProps = {};

export class PaymentProcessorLambda extends BaseLambda {
/**
 * Constructs a new instance of the PaymentProcessorLambda.
 *
 * @param scope The scope in which this construct is defined.
 * @param id The unique identifier for this construct.
 * @param props The properties for configuring this lambda function.
 */

  constructor(
    scope: Construct,
    id: string,
    props: PaymentProcessorLambdaProps
  ) {
    super(scope, id, {
      entry: paymentProcessorDefinition.entry,
      environment: {},
    });
  }
}


