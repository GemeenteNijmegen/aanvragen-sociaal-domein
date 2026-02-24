import { Stack, StackProps } from 'aws-cdk-lib';
import { IRestApi } from 'aws-cdk-lib/aws-apigateway';
import { IHostedZone } from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';
import { Configurable } from './Configuration';
import { SubmissionProcessor } from './submission-processor/SubmissionProcessor';

interface SocialSubmissionsStackProps extends StackProps, Configurable { }

export class SocialSubmissionsStack extends Stack {

  constructor(scope: Construct, id: string, private readonly props: SocialSubmissionsStackProps) {
    super(scope, id, props);

    // Submission Processor
    new SubmissionProcessor(this, 'submission-processor', {
      logLevel: props.configuration.logLevel,
      criticality: props.configuration.criticality,
    });

  }
}