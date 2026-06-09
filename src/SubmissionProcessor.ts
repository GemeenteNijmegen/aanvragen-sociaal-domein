import { Criticality, QueueWithDlq } from '@gemeentenijmegen/aws-constructs';
import { Duration } from 'aws-cdk-lib';
import { IKey, Key } from 'aws-cdk-lib/aws-kms';
import { SqsEventSource, SqsEventSourceProps } from 'aws-cdk-lib/aws-lambda-event-sources';
import { IQueue, Queue } from 'aws-cdk-lib/aws-sqs';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { setupESBQueue, setupESBIITQueue } from './outbound-senders/SetupESBQueues';
import { Statics } from './Statics';
import { SociaalReceiverFunction } from './submission-processor/sociaal-receiver-lambda/sociaal-receiver-function';


interface SubmissionProcessorOptions {
  /**
   * Log level
   * @default DEBUG
   */
  logLevel?: string;
  /**
   * Criticality
   */
  criticality: Criticality;
}

/**
 * Construct that ties the entire processing flow of a sociaal domein submission together
 * Expected input is always from the SQS and the output is the ESB SQS
 */
export class SubmissionProcessor extends Construct {
  private kmsKey: IKey;
  private inputQueueSociaal: IQueue;
  private esbQueu: QueueWithDlq;
  private esbIITQueue: QueueWithDlq;


  constructor(scope: Construct, id: string, private readonly options: SubmissionProcessorOptions) {
    super(scope, id);

    const kmsKeyArn = StringParameter.fromStringParameterName(this, 'kms-key-account-from-arn-ssm', Statics.ssmAccountSharedKmsKeyArn).stringValue;
    this.kmsKey = Key.fromKeyArn(this, 'kms-key-account-from-arn', kmsKeyArn);

    // Retrieve shared Sociaal Queue
    const inputQueueSociaalArn = StringParameter.fromStringParameterName(this, 'shared-submission-sqs-sociaal-arn-ssm', Statics.ssmSharedSubmissionSQSSociaalArn).stringValue;
    this.inputQueueSociaal = Queue.fromQueueArn(this, 'input-queue-sociaal', inputQueueSociaalArn) as Queue;

    this.esbQueu = setupESBQueue(this, this.kmsKey, this.options.criticality);
    this.esbIITQueue = setupESBIITQueue(this, this.kmsKey, this.options.criticality);
    this.setupSociaalReceiverLambda();
  }

  private setupSociaalReceiverLambda() {
    const sociaalReceiverLambda = new SociaalReceiverFunction(
      this, 'sociaal-receiver-lambda', {
        timeout: Duration.seconds(30),
        environment: {
          ESB_QUEUE_URL: this.esbQueu.queue.queueUrl,
          ESB_IIT_QUEUE_URL: this.esbIITQueue.queue.queueUrl,
          POWERTOOLS_LOG_LEVEL: this.options.logLevel ?? 'INFO',
        },
      },
    );
    this.inputQueueSociaal.grantConsumeMessages(sociaalReceiverLambda);
    sociaalReceiverLambda.addEventSource(new SqsEventSource(this.inputQueueSociaal, {
      batchSize: 1,
      maxBatchingWindow: Duration.seconds(5),
      reportBatchItemFailures: true,
    } as SqsEventSourceProps),
    );
    this.esbQueu.queue.grantSendMessages(sociaalReceiverLambda);
    this.esbIITQueue.queue.grantSendMessages(sociaalReceiverLambda);
    this.kmsKey.grantDecrypt(sociaalReceiverLambda);
  }
}