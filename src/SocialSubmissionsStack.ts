import { ErrorMonitoringAlarm } from '@gemeentenijmegen/aws-constructs';
import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { LambdaIntegration, RestApi, SecurityPolicy } from 'aws-cdk-lib/aws-apigateway';
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import { ARecord, HostedZone, IHostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { ApiGatewayDomain } from 'aws-cdk-lib/aws-route53-targets';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { Configurable } from './Configuration';
import { PrefillFunction } from './prefill/prefill-function';
import { Statics } from './Statics';
import { SubmissionProcessor } from './submission-processor/SubmissionProcessor';

interface SocialSubmissionsStackProps extends StackProps, Configurable { }

export class SocialSubmissionsStack extends Stack {

  private readonly hostedzone: IHostedZone;
  private readonly api: RestApi;

  constructor(scope: Construct, id: string, private readonly props: SocialSubmissionsStackProps) {
    super(scope, id, props);

    // Submission Processor
    new SubmissionProcessor(this, 'submission-processor', {
      logLevel: props.configuration.logLevel,
      criticality: props.configuration.criticality,
    });

    // Hosted zone and api-gateway
    this.hostedzone = this.importHostedzone();
    this.api = this.setupRestApi();

    // Prefill
    this.setupPrefill();

  }

  private setupPrefill() {
    const prefill = this.api.root.addResource('prefill');

    const prefillLambda = new PrefillFunction(this, 'prefill-lambda', {
      environment: {
        LOG_LEVEL: this.props.configuration.logLevel ? 'true' : 'false',
        IIT_AVI_PREFILL_ENDPOINT: StringParameter.valueForStringParameter(this, Statics.ssmName_individueleInkomensToeslagAviPrefillEndpoint),
      },
    });

    new ErrorMonitoringAlarm(this, 'prefill-lambda-alarm', {
      criticality: this.props.configuration.criticality.toString(),
      lambda: prefillLambda,
      errorRateProps: {
        alarmThreshold: 1,
        alarmEvaluationPeriods: 1,
        alarmEvaluationPeriod: Duration.minutes(15),
      },
    });

    //add throttling and api key
    const plan = this.api.addUsagePlan('usage-plan-prefill-api', {
      name: 'prefill',
      description: 'used for rate-limit and api key',
      throttle: {
        rateLimit: 5,
        burstLimit: 10,
      },
    });
    const key = this.api.addApiKey('api-key-prefill', {
      apiKeyName: 'prefill Api',
      description: 'gebruikt voor alle methods van prefill API',
    });

    plan.addApiKey(key);
    // plan.addApiStage({
    //   stage: this.api.deploymentStage,
    // }); Required?

    prefill.addMethod('POST', new LambdaIntegration(prefillLambda), {
      apiKeyRequired: true,
      requestParameters: {
        'method.request.querystring.formname': true,
      },
    });


  }

  private setupRestApi() {
    const domain = `api.${this.hostedzone.zoneName}`;
    const cert = new Certificate(this, 'certificate', {
      domainName: domain,
      validation: CertificateValidation.fromDns(this.hostedzone),
    });

    const api = new RestApi(this, 'api', {
      domainName: {
        certificate: cert,
        domainName: domain,
        securityPolicy: SecurityPolicy.TLS_1_2,
      },
    });

    const plan = api.addUsagePlan('UsagePlan', {
      description: 'OpenForms (Social) supporting infra API gateway',
      apiStages: [
        {
          api: api,
          stage: api.deploymentStage,
        },
      ],
    });

    const key = api.addApiKey('ApiKey', {
      description: 'OpenForms (Social) supporting infra API key',
    });

    plan.addApiKey(key);

    new ARecord(this, 'a-record', {
      target: RecordTarget.fromAlias(new ApiGatewayDomain(api.domainName!)),
      zone: this.hostedzone,
      recordName: domain,
    });

    return api;
  }

  private importHostedzone() {
    const accountRootZoneId = StringParameter.valueForStringParameter(this, Statics.accountHostedzoneId);
    const accountRootZoneName = StringParameter.valueForStringParameter(this, Statics.accountHostedzoneName);
    return HostedZone.fromHostedZoneAttributes(this, 'hostedzone', {
      hostedZoneId: accountRootZoneId,
      zoneName: accountRootZoneName,
    });
  }
}