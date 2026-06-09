import { Logger } from '@aws-lambda-powertools/logger';
import { Client, ClientSchema, EsbOutMessage, EsbOutMessageSchema, ZaakDmsRol } from './sqsESBOutMessage';
import { SqsSubmissionBody } from './sqsSubmissionBody';


// Berichtstoort correspondeert met de Suite codes. Hier zit een overgangssituatie in aan de Suite kant, daarom wordt het op deze manier opgebouwd.
export const BIJSTAND_TEMP_BERICHTSOORT = { VRIJ: { Onderwerp: '50', Categorie: '50' } };
export const BIJSTAND_BERICHTSOORT = {};
export const BBZ_TEMP_BERICHTSOORT = { VRIJ: { Onderwerp: '77', Categorie: '51' } };
export const BBZ_BERICHTSOORT = {};

export const BIJSTAND_ZAAKTYPECODE = 'B0901';
export const BBZ_ZAAKTYPECODE = 'B1061';

// Naar class met aparte mapper en error handling
export async function mapToEsbOut(input: SqsSubmissionBody, logger: Logger): Promise<EsbOutMessage> {
  const inputObject = input.enrichedObject;
  logger.debug('in mapToEsbOut enrichedObject', inputObject );
  // Later opdelen in kleinere stukken in de mapper-collaborators
  // Dit wordt in een geheel nieuwe flow ernaast gebouwd. Deze hele mapper wordt vervangen in zijn geheel
  logger.info(`${inputObject.reference} mapToEsbOut voor regeling ${inputObject.sociaalDomeinRegeling} and zaaktypeIdentificatie ${inputObject.zaaktypeIdentificatie}`);
  const submissionData = {
    zaaknummer: inputObject.reference,
    formReference: inputObject.reference,
    formName: inputObject.formName,
  };


  const regelingCodes: RegelingCodes = getRegelingCodes(inputObject.sociaalDomeinRegeling, inputObject.zaaktypeIdentificatie, logger);

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
        Berichtsoort: regelingCodes.berichtsoort, // ecode voorbeeld, nog flexibeler maken en checken
        AardVerzoek: 'RT', // Regulier Traject
        Aanvraagdatum: inputObject.datumAanvraag ? inputObject.datumAanvraag.replaceAll('-', '') : '20250101', //YYYYMMDD betere functie maken en anders huidige datum ophalen
        ZaakIdentificatie: submissionData.zaaknummer, //OF-0
        Toelichting: `Form: ${inputObject.formName}`, // Max. tekens
        Client: client,
      },
    }
    : undefined;


  // Zaakdms
  const extractRol = (clientData: Client | undefined): ZaakDmsRol | undefined => {
    if (!clientData) return undefined;

    return {
      natuurlijkPersoon: {
        'inp.bsn': clientData.BurgerServiceNr,
        'geslachtsnaam': clientData.Achternaam,
        'voorvoegselGeslachtsnaam': clientData.Voorvoegsel || '',
        'voorletters': clientData.Voornamen?.[0] || 'O', // eerste letter of 'O'nbekend
      },
    };
  };

  // In zaakDMS:
  const create = client ? {
    zender: { applicatie: 'AWS' },
    ontvanger: { applicatie: 'ZDS' },
    metadata: { zaaktypecode: regelingCodes.zaaktypeCode }, // hardcoded
    object: {
      referenceId: submissionData.zaaknummer,
      bevoegdgezag: 'Gemeente Nijmegen',
      omschrijving: `Formulieraanvraag ${submissionData.zaaknummer}`,
      status: 'Onbekend',
      startdatum: new Date().toISOString().split('T')[0],
      initiator: extractRol(client),
      belanghebbende: extractRol(client),
    },
  } : undefined;

  const zaakDMS = {
    zaaknummer: submissionData.zaaknummer,
    zaaktype: inputObject.zaaktypeIdentificatie,
    zaaktypecode: regelingCodes.zaaktypeCode,
    fileObjects: input.fileObjects,
    ...(create ? { create } : {}),
  };


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

export interface RegelingCodes {
  berichtsoort: Record<string, {
    Onderwerp: string;
    Categorie: string;
  }>;
  zaaktypeCode: string;
}

export function getRegelingCodes(sociaalDomeinRegeling: string | undefined, zaaktypeIdentificatie: string | undefined, logger: Logger) {
  // Dit wordt herbouwd in een aparte flow
  if (sociaalDomeinRegeling === 'BIJSTAND' && zaaktypeIdentificatie === 'BIJSTAND-AANVRAAG') {
    return {
      berichtsoort: BIJSTAND_TEMP_BERICHTSOORT,
      zaaktypeCode: BIJSTAND_ZAAKTYPECODE,
    };
  }

  if (sociaalDomeinRegeling === 'BBZ' && zaaktypeIdentificatie === 'BBZ-AANVRAAG') {
    return {
      berichtsoort: BBZ_TEMP_BERICHTSOORT,
      zaaktypeCode: BBZ_ZAAKTYPECODE,
    };
  }

  const error = `Check the settings of the form for sociaalDomeinRegeling=${sociaalDomeinRegeling}, zaaktypeIdentificatie=${zaaktypeIdentificatie}`;
  logger.error(error);
  throw Error(error);
}
