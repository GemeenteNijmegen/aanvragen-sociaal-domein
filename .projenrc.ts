import { GemeenteNijmegenCdkApp } from '@gemeentenijmegen/projen-project-type';
const project = new GemeenteNijmegenCdkApp({
  cdkVersion: '2.1.0',
  defaultReleaseBranch: 'main',
  deps: [
    '@gemeentenijmegen/utils',
    '@aws-sdk/client-sqs',
    'zod',
  ],
  devDeps: [
    '@gemeentenijmegen/projen-project-type',
    'dotenv',
    '@gemeentenijmegen/aws-constructs',
    '@aws-lambda-powertools/logger',
    '@types/aws-lambda',
  ],
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