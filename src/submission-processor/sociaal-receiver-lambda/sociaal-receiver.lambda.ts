import { Logger } from '@aws-lambda-powertools/logger';
const logger = new Logger();
export async function handler(event: any) {
      logger.debug('Lambda handler raw event', { event });
}