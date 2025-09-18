import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { iitEsbSchema } from '../schema/IITESB';

export async function sendIITToEsb(
  sqs: SQSClient,
  queueUrl: string,
  message: unknown,
  opts: { groupId: string; dedupId?: string },
) {
  const body = iitEsbSchema.parse(message); // keep output validated
  await sqs.send(
    new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(body),
      MessageGroupId: opts.groupId, // Voor fifo
      ...(opts.dedupId ? { MessageDeduplicationId: opts.dedupId } : {}),
    }),
  );
}