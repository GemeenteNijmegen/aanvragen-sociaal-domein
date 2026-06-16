import { Criticality, QueueWithDlq } from '@gemeentenijmegen/aws-constructs';
import { Role } from 'aws-cdk-lib/aws-iam';
import { IKey } from 'aws-cdk-lib/aws-kms';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { Statics } from '../Statics';


export function setupESBQueue(scope: Construct, kmsKey: IKey, criticality: Criticality): QueueWithDlq {
  const esbRoleArn = StringParameter.fromStringParameterName(
    scope, 'esb-role-arn-ssm', Statics.ssmSharedSubmissionEsbRoleArn,
  ).stringValue;

  const esbRole = Role.fromRoleArn(scope, 'esb-role-account-shared', esbRoleArn) as Role;

  return new QueueWithDlq(scope, 'esb-queue-with-dlq-sociaal-aanvragen', {
    identifier: 'esb-sociaal-aanvragen',
    kmsKey,
    fifo: true,
    criticality,
    role: esbRole,
    grantDlqSend: true,
  });
}

export function setupESBIITQueue(scope: Construct, kmsKey: IKey, criticality: Criticality): QueueWithDlq {
  const esbRoleArn = StringParameter.fromStringParameterName(scope, 'esb-iit-role-arn-ssm', Statics.ssmSharedSubmissionEsbRoleArn,
  ).stringValue;

  const esbRole = Role.fromRoleArn(scope, 'esb-iit-role-account-shared', esbRoleArn) as Role;

  return new QueueWithDlq(scope, 'esb-iit-queue-with-dlq-sociaal-aanvragen', {
    identifier: 'esb-iit-aanvragen',
    kmsKey,
    fifo: true,
    criticality,
    role: esbRole,
    grantDlqSend: true,
  });
}