import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Configurable } from './Configuration';

interface SocialSubmissionsStackProps extends StackProps, Configurable { }

export class SocialSubmissionsStack extends Stack {
  constructor(scope: Construct, id: string, private readonly props: SocialSubmissionsStackProps) {
    super(scope, id, props);

    // TODO add resources here

  }
}