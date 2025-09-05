import { z } from 'zod';

export const FileObjectSchema = z.looseObject({
  bucket: z.string(),
  objectKey: z.string(),
  fileName: z.string(),
});
export type FileObject = z.infer<typeof FileObjectSchema>;

export const AddressSchema = z.looseObject({
  Straatnaam: z.string().optional(),
  Huisnummer: z.string().optional(),
  Huisletter: z.string().optional(),
  HuisnrToevoeging: z.string().optional(),
  Postcode: z.string().optional(),
  Woonplaatsnaam: z.string().optional(),
  Gemeentenaam: z.string().optional(),
  Locatie: z.string().optional(),
  Wijkcode: z.string().optional(),
});
export type Address = z.infer<typeof AddressSchema>;

export const PhoneSchema = z.looseObject({
  Netnr: z.string().optional(),
  Abonneenr: z.string().optional(),
  TypeTelefoonnr: z.string().optional(),
});
export type Phone = z.infer<typeof PhoneSchema>;

export const ThemaSchema = z.looseObject({
  Onderwerp: z.string(),
  Categorie: z.string().optional(),
});
export type Thema = z.infer<typeof ThemaSchema>;


const berichtsoortKeys = ['WWB', 'IOAW', 'WMO', 'REI', 'SHV', 'INB', 'VRIJ'] as const;

export const BerichtsoortChoiceSchema = z
  .looseObject({
    WWB: ThemaSchema.optional(),
    IOAW: ThemaSchema.optional(),
    WMO: ThemaSchema.optional(),
    REI: z.looseObject({ Onderwerp: z.string() }).optional(),
    SHV: z.looseObject({ Onderwerp: z.string() }).optional(),
    INB: z.looseObject({ Onderwerp: z.string() }).optional(),
    VRIJ: ThemaSchema.optional(),
  })
  .refine(
    (val) => berichtsoortKeys.filter((k) => (val as any)?.[k] != null).length === 1,
    { message: 'Berichtsoort: exactly one of WWB, IOAW, WMO, REI, SHV, INB, VRIJ must be present' },
  );
export type BerichtsoortChoice = z.infer<typeof BerichtsoortChoiceSchema>;

export const ClientSchema = z.looseObject({
  BurgerServiceNr: z.string(), // required
  Voornamen: z.string().optional(),
  Voorletters: z.string().optional(),
  Voorvoegsel: z.string().optional(),
  Achternaam: z.string(), //required
  AanduidingNaamgebruik: z.string().optional(),
  VoorvoegselEchtgenoot: z.string().optional(),
  AchternaamEchtgenoot: z.string().optional(),
  Geslacht: z.string(), // required
  Geboortedatum: z.string(), //required
  CdFictieveGeboortedat: z.string().optional(),
  Correspondentieadres: AddressSchema.optional(),
  Feitelijkadres: AddressSchema.optional(),
  Nationaliteit: z.looseObject({ CdNationaliteit: z.string().optional() }).optional(),
  Iban: z.string().optional(),
  Bic: z.string().optional(),
  Telefoonnr: z.array(PhoneSchema).optional(),
  EMailAdresClient: z.string().optional(),
  Relatie: z.looseObject({
    SoortRelatie: z.string().optional(),
    Begindatum: z.string().optional(),
    CdFictieveBegindat: z.string().optional(),
    Partner: z.looseObject({
      BurgerServiceNr: z.string(),
      Voornamen: z.string().optional(),
      Voorletters: z.string().optional(),
      Voorvoegsel: z.string().optional(),
      Achternaam: z.string(),
      AanduidingNaamgebruik: z.string().optional(),
      VoorvoegselEchtgenoot: z.string().optional(),
      AchternaamEchtgenoot: z.string().optional(),
      Geslacht: z.string(),
      Geboortedatum: z.string(),
      CdFictieveGeboortedat: z.string().optional(),
      Correspondentieadres: AddressSchema.optional(),
      Feitelijkadres: AddressSchema.optional(),
      Nationaliteit: z.looseObject({ CdNationaliteit: z.string().optional() }).optional(),
      Iban: z.string().optional(),
      Bic: z.string().optional(),
      Telefoonnr: z.array(PhoneSchema).optional(),
      EMailAdresClient: z.string().optional(),
    }).optional(),
  }).optional(),
});
export type Client = z.infer<typeof ClientSchema>;

export const EsbOutMessageSchema = z.looseObject({
  submissionData: z.looseObject({
    zaaknummer: z.string().optional(),
    formReference: z.string().optional(),
    formName: z.string().optional(),
  }).optional(),

  zaakDMS: z.looseObject({
    zaaknummer: z.string().optional(),
    zaaktype: z.string().optional(),
    fileObjects: z.array(FileObjectSchema).optional(),
  }).optional(),

  werkprocesIntake: z.looseObject({
    Webintake: z.looseObject({
      Berichtsoort: BerichtsoortChoiceSchema,
      Aanvraagdatum: z.string().optional(),
      ZaakIdentificatie: z.string().optional(),
      AardVerzoek: z.string().optional(),
      Toelichting: z.string().optional(),
      Client: ClientSchema.optional(),
      IndBestaandeKlant: z.string().optional(),
      bijlage: z.any().optional(),
    }),
  }).optional(),
});
export type EsbOutMessage = z.infer<typeof EsbOutMessageSchema>;