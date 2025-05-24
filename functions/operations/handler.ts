import { ScheduledEvent } from 'aws-lambda';

export const handler = async (event: ScheduledEvent): Promise<void> => {
  const timestamp = new Date().toISOString();
  console.log('Ran at', timestamp);

  return;
};
