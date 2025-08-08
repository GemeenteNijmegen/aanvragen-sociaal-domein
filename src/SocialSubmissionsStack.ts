import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Configurable } from './Configuration';
import { SubmissionProcessor } from './submission-processor/SubmissionProcessor';

interface SocialSubmissionsStackProps extends StackProps, Configurable {}

export class SocialSubmissionsStack extends Stack {
  constructor(scope: Construct, id: string, private readonly props: SocialSubmissionsStackProps) {
    super(scope, id, props);

    new SubmissionProcessor(this, 'submission-processor', {
      logLevel: props.configuration.logLevel,
      criticality: props.configuration.criticality,
    });


  }
}