import { lambda, logger } from "../lib/lambda.ts";

export const handler = lambda.scheduledHandler(
  async (event) => {
    logger.info("Scheduled event triggered", { event });
    return;
  }
);