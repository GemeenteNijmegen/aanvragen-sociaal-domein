export const fixtureAanvraagSociaalDomeinBsn = {
  enrichedObject: {
    pdf: 'https://mijn-services.accp.nijmegen.nl/open-zaak/documenten/api/v1/enkelvoudiginformatieobjecten/8ae06033-5bbc-414d-abd3-99e74ef125fd',
    attachments: [],
    reference: 'OF-8MY2B8',
    objectUrl: 'https://mijn-services.accp.nijmegen.nl/objects/api/v2/objects/fdf420ed-6562-4102-9fa7-dc0569c0081f',
    objectUUID: 'fdf420ed-6562-4102-9fa7-dc0569c0081f',
    sociaalDomeinRegeling: 'IIT',
    zaaktypeIdentificatie: 'INDIVIDUELE-INKOMENSTOESLAG',
    datumAanvraag: '2025-12-12',
    bsn: '999971797',
    kvk: '',
    bsnNamens: '',
    inlogmiddel: 'bsn',
    formName: 'Individuele inkomenstoeslag aanvragen',
    networkShare: '//karelstad/webdata/Webformulieren/TEST/',
    monitoringNetworkShare: '//karelstad/webdata/Webformulieren/TEST/a spatie map',
    internalNotificationEmails: ['test-example@nijmegen.nl'],
    bsnOrKvkToFile: true,
    aanvragerGegevens: {
      email: '',
      bewindvoering: false,
    },
    client: {
      BurgerServiceNr: '999971797',
      Voorletters: 'P.',
      Achternaam: 'Hendriks',
      Geslacht: 'man',
      Geboortedatum: '1985-10-10',
      Correspondentieadres: {
        Straatnaam: 'Korte Nieuwstraat',
        Huisnummer: '6',
        Woonplaatsnaam: '',
        Gemeentenaam: 'Nijmegen',
        Postcode: '6511PP',
      },
      EMailAdresClient: 'test-example@nijmegen.nl',
    },
  },
  filePaths: [
    's3://open-forms-main-stack-submissionforwardersubmissio-zwnxg2nji9fu/OF-8MY2B8/OF-8MY2B8.pdf',
  ],
  fileObjects: [
    {
      bucket: 'open-forms-main-stack-submissionforwardersubmissio-zwnxg2nji9fu',
      objectKey: 'OF-8MY2B8/OF-8MY2B8.pdf',
      fileName: 'OF-8MY2B8.pdf',
      objectType: 'submission',
    },
  ],
};

export const fixtureAanvraagSociaalDomeinKvk = {
  enrichedObject: {
    pdf: 'https://mijn-services.accp.nijmegen.nl/open-zaak/documenten/api/v1/enkelvoudiginformatieobjecten/6dcef7f7-e2e0-418a-ac80-907863534322',
    attachments: [],
    reference: 'OF-WUGP3V',
    objectUrl: 'https://mijn-services.accp.nijmegen.nl/objects/api/v2/objects/26908a3b-5d45-4803-a2fa-6fa4ba79ce71',
    objectUUID: '26908a3b-5d45-4803-a2fa-6fa4ba79ce71',
    sociaalDomeinRegeling: 'IIT',
    zaaktypeIdentificatie: 'INDIVIDUELE-INKOMENSTOESLAG',
    datumAanvraag: '2025-12-12',
    bsn: '',
    kvk: '69599084',
    bsnNamens: '999971773',
    inlogmiddel: 'kvk',
    formName: 'Individuele inkomenstoeslag aanvragen',
    networkShare: '//karelstad/webdata/Webformulieren/TEST/',
    monitoringNetworkShare: '//karelstad/webdata/Webformulieren/TEST/a spatie map',
    internalNotificationEmails: ['test-example@nijmegen.nl'],
    bsnOrKvkToFile: true,
    aanvragerGegevens: {
      email: 'test-example@nijmegen.nl',
      bewindvoering: false,
    },
    client: {
      BurgerServiceNr: '',
      Voorletters: '',
      Achternaam: '',
      Geslacht: '',
      Geboortedatum: '',
      Correspondentieadres: {
        Straatnaam: '',
        Huisnummer: '',
        Woonplaatsnaam: 'Amsterdam',
        Gemeentenaam: '',
      },
      Feitelijkadres: {
        Postcode: '',
      },
      EMailAdresClient: '',
    },
  },
  filePaths: [
    's3://open-forms-main-stack-submissionforwardersubmissio-zwnxg2nji9fu/OF-WUGP3V/OF-WUGP3V.pdf',
  ],
  fileObjects: [
    {
      bucket: 'open-forms-main-stack-submissionforwardersubmissio-zwnxg2nji9fu',
      objectKey: 'OF-WUGP3V/OF-WUGP3V.pdf',
      fileName: 'OF-WUGP3V.pdf',
      objectType: 'submission',
    },
  ],
};

export const fixtureESBIITOutBsn = {
  bsn: '999971797',
  formName: 'Individuele inkomenstoeslag aanvragen',
  reference: 'OF-8MY2B8',
  inlogmiddel: 'digid',
  fileObjects: [
    {
      bucket: 'open-forms-main-stack-submissionforwardersubmissio-zwnxg2nji9fu',
      objectKey: 'OF-8MY2B8/OF-8MY2B8.pdf',
      fileName: 'OF-8MY2B8.pdf',
      objectType: 'submission',
    },
  ],
  brpData: {
    Persoon: {
      Persoonsgegevens: {
        Voornamen: '',
        Voorletters: 'P.',
        Achternaam: 'Hendriks',
        Geslachtsnaam: 'Hendriks',
        Geslacht: 'M',
        Geboortedatum: '10-10-1985',
      },
      Adres: {
        Straat: 'Korte Nieuwstraat',
        Huisnummer: '6',
        Postcode: '6511PP',
        Woonplaats: '',
        Gemeente: 'Nijmegen',
      },
    },
  },
};

export const fixtureESBIITOutKvk = {
  bsn: '999971773',
  kvknummer: '69599084',
  formName: 'Individuele inkomenstoeslag aanvragen',
  reference: 'OF-WUGP3V',
  inlogmiddel: 'eherkenning',
  fileObjects: [
    {
      bucket: 'open-forms-main-stack-submissionforwardersubmissio-zwnxg2nji9fu',
      objectKey: 'OF-WUGP3V/OF-WUGP3V.pdf',
      fileName: 'OF-WUGP3V.pdf',
      objectType: 'submission',
    },
  ],
};
