import * as constructs from "constructs";
import { BaseLambda } from "../lambda.ts";
import paymentProcessorDefinition from "../../../functions/payments_processor/index.ts";
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
    scope: constructs.Construct,
    id: string,
    props: PaymentProcessorLambdaProps
  ) {
    super(scope, id, {
      entry: paymentProcessorDefinition.entry,
      environment: {},
    });
  }
}
