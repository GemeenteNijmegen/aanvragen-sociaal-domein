import { Logger } from '@aws-lambda-powertools/logger';
import { Client, ClientSchema, EsbOutMessage, EsbOutMessageSchema } from './sqsESBOutMessage';
import { SqsSubmissionBody } from './sqsSubmissionBody';

// Naar class met aparte mapper en error handling
export async function mapToEsbOut(input: SqsSubmissionBody, logger: Logger): Promise<EsbOutMessage> {
  const inputObject = input.enrichedObject;
  logger.debug('in mapToEsbOut enrichedObject', inputObject );
  // Later opdelen in kleinere stukken in de mapper-collaborators

  const submissionData = {
    zaaknummer: inputObject.reference,
    formReference: inputObject.reference,
    formName: inputObject.formName,
  };

  const zaakDMS = {
    zaaknummer: submissionData.zaaknummer,
    zaaktype: inputObject.zaaktypeIdentificatie,
    fileObjects: inputObject.fileObjects,
  };


  const client: Client | undefined = (() => {
    if (!inputObject.client) return undefined;
    const parsed = ClientSchema.safeParse(inputObject.client);
    logger.debug('Parse Client', parsed);
    logger.debug('Let op geboortedatum, vooral format');
    return parsed.success ? parsed.data : undefined;
  })();

  const werkprocesIntake = client
    ? {
      Webintake: {
        Berichtsoort: { WWB: { Onderwerp: 'Aanvraag ALO', Categorie: '1' } }, // ecode voorbeeld, nog flexibeler maken en checken
        AardVerzoek: 'RT',
        Aanvraagdatum: inputObject.datumAanvraag,
        ZaakIdentificatie: submissionData.zaaknummer,
        Toelichting: `Form: ${inputObject.formName}`,
        Client: client,
      },
    }
    : undefined;

  const esbSqsBody = {
    submissionData,
    zaakDMS,
    ...(werkprocesIntake ? { werkprocesIntake } : {}),
  };
  logger.debug('esbSqsBody before parse', esbSqsBody);
  // Snelle validatie, hoewel nog looseObject is
  const esbSqsBodyParsed = EsbOutMessageSchema.safeParse(esbSqsBody);
  logger.debug('parsed', esbSqsBodyParsed);
  return esbSqsBodyParsed.success ? esbSqsBodyParsed.data : {};
}
