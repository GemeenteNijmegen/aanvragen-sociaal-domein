export class Statics {

  /**
   * Name of this project
   * Used in PipelineStack and Statics
   */
  static readonly projectName = 'aanvragen-sociaal-domein';
  /**
   * Github repository of this project
   * Used in the PipelineStack
   * TODO make sure this is correct
   */
  static readonly githubRepository = `GemeenteNijmegen/${Statics.projectName}`;

  static readonly ssmDummyParameter = `/${Statics.projectName}/dummy/parameter`;

  // MARK: environments
  static readonly buildEnvironment = {
    account: '836443378780',
    region: 'eu-central-1',
  };

  static readonly gnOpenFormsAccp = {
    account: '043309345347',
    region: 'eu-central-1',
  };

  static readonly gnOpenFormsProd = {
    account: '761018864362',
    region: 'eu-central-1',
  };

  // MARK: account hostedzone
  static readonly accountHostedzonePath = '/gemeente-nijmegen/account/hostedzone';
  static readonly accountHostedzoneName = '/gemeente-nijmegen/account/hostedzone/name';
  static readonly accountHostedzoneId = '/gemeente-nijmegen/account/hostedzone/id';

  /**
 * KMS account key alias
  */
  static readonly ALIAS_ACCOUNT_KMS_KEY = 'alias/open-forms-account-kms-key';
  /**
   * KMS key arn in SSM param
   */
  static readonly ssmAccountSharedKmsKeyArn = '/shared/kmskey/arn'; // Do not change or remove

  /**
   * Shared ARN SSM parameter names
   * These params point to shared resources in the Open Forms account
   * The role and sqs are used in two different Github repo's, but are present in the same gn-account
   * This repo sets the params, which will be retrieved by aanvragen-sociaal-domein github repo
   */
  static readonly ssmSharedSubmissionEsbRoleArn = '/shared/submission/esbrole/arn'; // Do not change or remove
  static readonly ssmSharedSubmissionSQSSociaalArn = '/shared/submission/sqs/sociaal/arn'; // Do not change or remove


}