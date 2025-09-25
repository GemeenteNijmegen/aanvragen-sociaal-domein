import { Logger } from '@aws-lambda-powertools/logger';
import { ClientSchema, EsbOutMessage } from './sqsESBOutMessage';
import { SqsSubmissionBody } from './sqsSubmissionBody';
import { iitEsbSchema, iitPersoon } from '../schema/IITESB';

// Naar class met aparte mapper en error handling
export async function mapIITToEsbOut(input: SqsSubmissionBody, logger: Logger): Promise<EsbOutMessage> {
  const inputObject = input.enrichedObject;
  logger.debug('in mapToEsbOut enrichedObject', inputObject );
  logger.debug('in mapIITToEsbOut fileObjects in input object', input );
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

    let geslacht = '';
    if(parsed.data.Geslacht.toLowerCase() == "man"){ geslacht = "M"}
    if(parsed.data.Geslacht.toLowerCase() == "vrouw"){ geslacht = "V"}

    const brpDataPersoon = {
      Persoonsgegevens: {
        Voorletters: parsed.data.Voorletters ?? '',
        Voornamen: parsed.data.Voornamen ?? '',
        Achternaam: parsed.data.Achternaam ?? '',
        Geslachtsnaam: parsed.data.Achternaam ?? '',
        Geslacht: geslacht ?? '',
        Geboortedatum: isoToDmyOrDefault(parsed.data.Geboortedatum),
      },
      Adres: {
        Straat: parsed.data.Feitelijkadres?.Straatnaam ?? '',
        Huisnummer: parsed.data.Feitelijkadres?.Huisnummer ?? '',
        Postcode: parsed.data.Feitelijkadres?.Postcode ?? '',
        Woonplaats: parsed.data.Feitelijkadres?.Woonplaatsnaam ?? '',
        Gemeente: parsed.data.Feitelijkadres?.Woonplaatsnaam ?? '',
      },
    } as iitPersoon;
    return brpDataPersoon;
  })();


  const esbSqsBody = {
    ...submissionMainData,
    fileObjects: input.fileObjects,
    brpData: { Persoon: persoon },
  };
  logger.debug('esbSqsBody before parse:', { esbSqsBody });
  // Snelle validatie, hoewel nog looseObject is
  const esbSqsBodyParsed = iitEsbSchema.safeParse(esbSqsBody);
  logger.debug('parsed', esbSqsBodyParsed);
  return esbSqsBodyParsed.success ? esbSqsBodyParsed.data : {};
}

export const isoToDmyOrDefault = (s: string): string => {
  const DEFAULT_DMY = '01-01-1900';
  // If it matches YYYY-MM-DD, flip to DD-MM-YYYY; else default.
  const out = s.replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$3-$2-$1');
  return out === s ? DEFAULT_DMY : out;
};