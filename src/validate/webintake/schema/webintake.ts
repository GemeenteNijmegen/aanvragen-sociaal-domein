import { z } from 'zod';
import { aardVerzoek, datum, indBestaandeKlant, vrijeTekst, zaakIdentificatie } from './fieldRules';

const berichtsoort = z.looseObject({});
const client = z.looseObject({});

export const webintake = z.strictObject({
  Berichtsoort: berichtsoort,
  Aanvraagdatum: datum,
  ZaakIdentificatie: zaakIdentificatie.optional(),
  AardVerzoek: aardVerzoek.optional(),
  Toelichting: vrijeTekst.optional(),
  Client: client,
  IndBestaandeKlant: indBestaandeKlant.optional(),
});
