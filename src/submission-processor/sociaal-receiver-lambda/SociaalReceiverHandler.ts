import { Logger } from '@aws-lambda-powertools/logger';
import { Tracer } from '@aws-lambda-powertools/tracer';
import type { SQSClient } from '@aws-sdk/client-sqs';
import type { SQSRecord } from 'aws-lambda';
import { mapIITToEsbOut } from './EsbIITOutMapper';
import { sendIITToEsb } from './EsbIITSender';
import { mapToEsbOut } from './EsbOutMapper';
import { sendToEsb } from './EsbSender';
import { SqsSubmissionBodySchema } from './sqsSubmissionBody';


export interface SociaalReceiverHandlerProps {
  esbQueueUrl: string;
  esbIITQueueUrl: string;
  sqs: SQSClient;
  tracer?: Tracer;
  logger: Logger;
}

export class SociaalReceiverHandler {
  constructor(private readonly props: SociaalReceiverHandlerProps) {}

  async handle(record: SQSRecord) {
    const input = SqsSubmissionBodySchema.parse(JSON.parse(record.body));
    this.props.logger.appendKeys({ formReference: input.enrichedObject.reference });

    const groupId = input.enrichedObject.zaaktypeIdentificatie ?? 'sociaal';
    const dedupId = input.enrichedObject.reference ?? input.enrichedObject.objectUUID;

    if (input.enrichedObject.sociaalDomeinRegeling == 'IIT') {
      this.props.logger.debug('IIT inzending', input);
      const esbOut = await mapIITToEsbOut(input, this.props.logger);
      this.props.logger.debug('Result mapToEsbOut', esbOut);
      await sendIITToEsb(this.props.sqs, this.props.esbIITQueueUrl, esbOut, { groupId, dedupId });
    } else {
    // ALO standaard
    // Gaat naar aparte lambda's
      this.props.logger.debug('Start mapToEsbOut voor ALO');
      const esbOut = await mapToEsbOut(input, this.props.logger);
      this.props.logger.debug('Result mapToEsbOut', esbOut);
      await sendToEsb(this.props.sqs, this.props.esbQueueUrl, esbOut, { groupId, dedupId });

      this.props.logger.debug('Forwarded to ESB', {
        messageId: record.messageId,
        groupId,
        dedupId,
      });
    //ALO standaard einde
    }


  }
}