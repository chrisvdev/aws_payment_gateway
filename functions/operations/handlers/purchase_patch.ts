import { lambda, logger } from "../../lib/lambda.ts";

export const purchasePatch = lambda.HTTPEventHandler<unknown,any>(
  async (event) => {
    logger.info('event', JSON.stringify(event));
    const response = {
      statusCode: 200,
      body: { message: 'Hello from purchasePatch Lambda!' },
    };
    return response;
  }
)