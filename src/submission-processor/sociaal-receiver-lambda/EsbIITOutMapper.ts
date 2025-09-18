import { Logger } from '@aws-lambda-powertools/logger';
import { Client, ClientSchema, EsbOutMessage, EsbOutMessageSchema } from './sqsESBOutMessage';
import { SqsSubmissionBody } from './sqsSubmissionBody';
import { iitEsbSchema, iitPersoon } from '../schema/IITESB';

// Naar class met aparte mapper en error handling
export async function mapIITToEsbOut(input: SqsSubmissionBody, logger: Logger): Promise<EsbOutMessage> {
  const inputObject = input.enrichedObject;
  logger.debug('in mapToEsbOut enrichedObject', inputObject );
  // Later opdelen in kleinere stukken in de mapper-collaborators

  const submissionMainData = {
    inlogmiddel: 'digid', // vervangen voor eherkenning of digid
    reference: inputObject.reference,
    formName: inputObject.formName,
    bsn: inputObject.bsn, // vervangen voor optional bsnNamens bij kvk
  };


  const persoon: any | undefined = (() => {
    if (!inputObject.client) {
      logger.debug('KVK scenario');
      return undefined;
    }
    const parsed = ClientSchema.safeParse(inputObject.client);
    logger.debug('Parse Client', parsed);
    if (!parsed.success) return undefined;

    const brpDataPersoon = {
      Persoonsgegevens: {
        Voorletters: parsed.data.Voorletters ?? '',
        Voornamen: parsed.data.Voornamen ?? '',
        Achternaam: parsed.data.Achternaam ?? '',
        Geslacht: parsed.data.Geslacht ?? 'onbekend',
        Geboortedatum: parsed.data.Geboortedatum ?? '01-01-1900',
      },
      Adres: {
        Straat: parsed.data.Correspondentieadres?.Straatnaam ?? '',
        Huisnummer: parsed.data.Correspondentieadres?.Huisnummer ?? '',
        Postcode: parsed.data.Correspondentieadres?.Postcode ?? '',
        Woonplaats: parsed.data.Correspondentieadres?.Woonplaatsnaam ?? '',
      },
    } as iitPersoon;
    return brpDataPersoon;
  })();


  const esbSqsBody = {
    submissionMainData,
    fileObjects: input.fileObjects,
    brpData: { Persoon: persoon },
  };
  logger.debug('esbSqsBody before parse', esbSqsBody);
  // Snelle validatie, hoewel nog looseObject is
  const esbSqsBodyParsed = iitEsbSchema.safeParse(esbSqsBody);
  logger.debug('parsed', esbSqsBodyParsed);
  return esbSqsBodyParsed.success ? esbSqsBodyParsed.data : {};
}
