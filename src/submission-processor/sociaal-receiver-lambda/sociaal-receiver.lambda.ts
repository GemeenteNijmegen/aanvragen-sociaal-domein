import { BatchProcessor, EventType, processPartialResponse } from '@aws-lambda-powertools/batch';
import { Logger } from '@aws-lambda-powertools/logger';
import { Tracer } from '@aws-lambda-powertools/tracer';
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware';
import { SQSClient } from '@aws-sdk/client-sqs';
import { environmentVariables } from '@gemeentenijmegen/utils';
import middy from '@middy/core';
import type { SQSEvent, SQSHandler, SQSRecord } from 'aws-lambda';
import { SociaalReceiverHandler, SociaalReceiverHandlerProps } from './SociaalReceiverHandler';


const processor = new BatchProcessor(EventType.SQS);

const tracer = new Tracer({
  serviceName: 'sociaal-receiver',
});
tracer.annotateColdStart(); // Hier nog naar kijken, levert onnodige errors op in logs
tracer.addServiceNameAnnotation();

const logger = new Logger({ serviceName: 'sociaal-receiver' });

async function initalize(): Promise<SociaalReceiverHandlerProps> {
  const env = environmentVariables(['ESB_QUEUE_URL', 'ESB_IIT_QUEUE_URL']);
  const sqs = new SQSClient({});
  return {
    esbQueueUrl: env.ESB_QUEUE_URL,
    esbIITQueueUrl: env.ESB_IIT_QUEUE_URL,
    sqs,
    tracer,
    logger,
  };
}

export async function recordHandler(record: SQSRecord, props: SociaalReceiverHandlerProps) {
  logger.debug('recordHandler before handler');
  try {
    const handler = new SociaalReceiverHandler(props);
    await handler.handle(record);
  } catch (error) {
    props.logger.error('Error during processing of record', error as Error);
    props.tracer?.addErrorAsMetadata(error as Error);
    throw Error('Failed to handle SQS message');
  }
}

export const handler: SQSHandler = middy(async (event: SQSEvent) => {
  const configuration = await initalize();
  const configuredRecordHandler = (record: SQSRecord) => recordHandler(record, configuration);
  await processPartialResponse(event, configuredRecordHandler, processor);
}).use(captureLambdaHandler(tracer));