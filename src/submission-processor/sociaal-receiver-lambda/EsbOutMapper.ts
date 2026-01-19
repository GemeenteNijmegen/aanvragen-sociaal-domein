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
    fileObjects: input.fileObjects,
  };


  const client: Client | undefined = (() => {
    if (!inputObject.client) return undefined;
    const parsed = ClientSchema.safeParse(inputObject.client);
    logger.debug('Parse Client', parsed);
    logger.debug('Let op geboortedatum, vooral format YYYYMMDD');
    if (!parsed.success) return undefined;

    const { Geboortedatum, Geslacht, ...rest } = parsed.data;
    const parsedClient: Client = {
      // CdFictieveGeboortedat moet voor emailadres komen.
      Geboortedatum: Geboortedatum.replaceAll('-', ''),
      CdFictieveGeboortedat: '0', // Bij Functioneel checken wat dit in het proces aangeeft en de andere waarden zijn
      Geslacht: Geslacht == 'vrouw' ? '2' : '1', // opties 0,1,2,9 en bij Functioneel checken wat dit doet
      ...rest,
    };

    return parsedClient;
  })();

  const werkprocesIntake = client
    ? {
      Webintake: {
        Berichtsoort: { VRIJ: { Onderwerp: '50', Categorie: '50' } }, // ecode voorbeeld, nog flexibeler maken en checken
        AardVerzoek: 'RT', // Regulier Traject
        Aanvraagdatum: inputObject.datumAanvraag ? inputObject.datumAanvraag.replaceAll('-', '') : '20250101', //YYYYMMDD betere functie maken en anders huidige datum ophalen
        ZaakIdentificatie: submissionData.zaaknummer, //OF-0
        Toelichting: `Form: ${inputObject.formName}`, // Max. tekens
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
