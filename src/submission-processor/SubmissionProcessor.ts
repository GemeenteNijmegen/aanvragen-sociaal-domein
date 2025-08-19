import { Criticality, QueueWithDlq } from '@gemeentenijmegen/aws-constructs';
import { Duration } from 'aws-cdk-lib';
import { Role } from 'aws-cdk-lib/aws-iam';
import { IKey, Key } from 'aws-cdk-lib/aws-kms';
import { SqsEventSource, SqsEventSourceProps } from 'aws-cdk-lib/aws-lambda-event-sources';
import { IQueue, Queue } from 'aws-cdk-lib/aws-sqs';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { Statics } from '../Statics';
import { SociaalReceiverFunction } from './sociaal-receiver-lambda/sociaal-receiver-function';


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


  constructor(scope: Construct, id: string, private readonly options: SubmissionProcessorOptions) {
    super(scope, id);

    const kmsKeyArn = StringParameter.fromStringParameterName(this, 'kms-key-account-from-arn-ssm', Statics.ssmAccountSharedKmsKeyArn).stringValue;
    this.kmsKey = Key.fromKeyArn(this, 'kms-key-account-from-arn', kmsKeyArn);

    // Retrieve shared Sociaal Queue
    const inputQueueSociaalArn = StringParameter.fromStringParameterName(this, 'shared-submission-sqs-sociaal-arn-ssm', Statics.ssmSharedSubmissionSQSSociaalArn).stringValue;
    this.inputQueueSociaal = Queue.fromQueueArn(this, 'input-queue-sociaal', inputQueueSociaalArn) as Queue;

    this.esbQueu = this.setupESBQueue();
    this.setupSociaalReceiverLambda();
  }

  private setupSociaalReceiverLambda() {
    const sociaalReceiverLambda = new SociaalReceiverFunction(
      this, 'sociaal-receiver-lambda', {
        timeout: Duration.seconds(30),
        environment: {
          ESB_QUEUE_URL: this.esbQueu.queue.queueUrl,
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
  }
  private setupESBQueue() {
    const esbRoleArn = StringParameter.fromStringParameterName(this, 'esb-role-arn-ssm', Statics.ssmSharedSubmissionEsbRoleArn).stringValue;
    const esbRole = Role.fromRoleArn(this, 'esb-role-account-shared', esbRoleArn) as Role;

    const esbQueue = new QueueWithDlq(this, 'esb-queue-with-dlq-sociaal-aanvragen', {
      identifier: 'esb-sociaal-aanvragen',
      kmsKey: this.kmsKey,
      fifo: true,
      criticality: this.options.criticality,
      role: esbRole,
      grantDlqSend: true,
    });
    return esbQueue;
  };
}