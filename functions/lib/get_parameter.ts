import { logger } from './lambda.ts';
import { getParameter as ssmGetParameter } from '@aws-lambda-powertools/parameters/ssm';
import getEnvironmentVariable from './environment.ts';

const appId = getEnvironmentVariable('AWS_LAMBDA_FUNCTION_NAME').split('-')[0];
export default async function getParameter(
  varName: string
): Promise<string> {
  try {
    const value = await ssmGetParameter(`/${appId}/${varName}`);
    if (!value) {
      throw new Error(`Parameter ${varName} is not set`);
    }
    return value;
  } catch (error) {
    logger.error(`Error retrieving parameter ${varName}:`, error as Error);
    throw new Error(`Error retrieving parameter ${varName}`);
  }
}
