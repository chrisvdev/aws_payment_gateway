import { lambda, logger } from "../../lib/lambda.ts";

export const purchaseGet = lambda.HTTPEventHandler<unknown>(
  async (event) => {
    logger.info('event', JSON.stringify(event));
    const response = {
      statusCode: 200,
      body: JSON.stringify({ message: 'Hello from purchaseGet Lambda!' }),
    };
    return response;
  }
)