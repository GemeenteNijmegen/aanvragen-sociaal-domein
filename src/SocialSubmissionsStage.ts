import { PermissionsBoundaryAspect } from '@gemeentenijmegen/aws-constructs';
import { Aspects, Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Configurable } from './Configuration';
import { SocialSubmissionsStack } from './SocialSubmissionsStack';
interface SocialSubmissionsProps extends StageProps, Configurable { }

/**
 * Main cdk app stage for Submissions in Social Domain
 * Receives input from Open Forms submissions specific for social domain
 */
export class SocialSubmissionsStage extends Stage {

  constructor(scope: Construct, id: string, props: SocialSubmissionsProps) {
    super(scope, id, props);
    Aspects.of(this).add(new PermissionsBoundaryAspect());

    /**
     * Main stack of this project for Submissions in Social Domain
     */
    new SocialSubmissionsStack(this, 'sociaal-submission-stack', {
      configuration: props.configuration,
    });

  }

}