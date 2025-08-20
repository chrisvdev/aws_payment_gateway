import { lambda, logger } from "../lib/lambda.ts";
import { type Request } from "./schemas.ts";

export const handler = lambda.HTTPEventHandler<Request>(
  async (event) => {
    logger.info('event', JSON.stringify(event));
    const response = {
      statusCode: 200,
      body: JSON.stringify({ message: 'Hello from Lambda!' }),
    };
    return response;
  }
)






