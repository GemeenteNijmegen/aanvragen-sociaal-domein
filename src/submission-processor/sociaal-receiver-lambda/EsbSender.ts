import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { EsbOutMessageSchema } from './sqsESBOutMessage';

export async function sendToEsb(
  sqs: SQSClient,
  queueUrl: string,
  message: unknown,
  opts: { groupId: string; dedupId?: string },
) {
  const body = EsbOutMessageSchema.parse(message); // keep output validated
  await sqs.send(
    new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(body),
      MessageGroupId: opts.groupId, // Voor fifo
      ...(opts.dedupId ? { MessageDeduplicationId: opts.dedupId } : {}),
    }),
  );
}