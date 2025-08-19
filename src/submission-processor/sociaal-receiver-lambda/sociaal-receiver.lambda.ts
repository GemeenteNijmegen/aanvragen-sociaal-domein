import { Logger } from '@aws-lambda-powertools/logger';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { environmentVariables } from '@gemeentenijmegen/utils';
import { SqsSubmissionBodySchema } from './sqsSubmissionBody';

const logger = new Logger({ serviceName: 'sociaal-receiver-lambda' });
const env = environmentVariables(['ESB_QUEUE_URL']);

const sqs = new SQSClient({});

export async function handler(event: any) {
  logger.debug('Lambda handler raw event', { event });
  const queueUrl = env.ESB_QUEUE_URL;
  const failures: { itemIdentifier: string }[] = [];

  for (const record of event.Records) {
    try {
      const parsed = SqsSubmissionBodySchema.parse(JSON.parse(record.body));

      const groupId = parsed.enrichedObject.zaaktypeIdentificatie || 'sociaal';
      const dedupId = parsed.enrichedObject.reference;

      await sqs.send(new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify(parsed),
        MessageGroupId: groupId,
        MessageDeduplicationId: dedupId,
      }));

      logger.debug('Forwarded to ESB', { messageId: record.messageId, groupId, dedupId });
    } catch (err) {
      failures.push({ itemIdentifier: record.messageId });
      logger.error('Failed to process record', { messageId: record.messageId, err: (err as Error).message });
    }
  }

  return { batchItemFailures: failures };
}