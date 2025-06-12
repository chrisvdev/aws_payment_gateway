import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('event', JSON.stringify(event));
  const response = {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello from Lambda!' }),
  };

  return response;
};
