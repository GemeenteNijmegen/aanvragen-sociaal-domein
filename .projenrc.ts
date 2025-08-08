import { GemeenteNijmegenCdkApp } from '@gemeentenijmegen/projen-project-type';
const project = new GemeenteNijmegenCdkApp({
  cdkVersion: '2.1.0',
  defaultReleaseBranch: 'main',
  devDeps: ['@gemeentenijmegen/projen-project-type', 'dotenv',
    '@gemeentenijmegen/aws-constructs', '@gemeentenijmegen/utils', '@aws-sdk/client-sqs', '@aws-lambda-powertools/logger',
    'zod'],
  jestOptions: {
    jestConfig: {
      setupFiles: ['dotenv/config'],
    },
  },
  gitignore: [
    '**/output/',
  ],
  name: 'aanvragen-sociaal-domein',
  projenrcTs: true,
});
project.synth();