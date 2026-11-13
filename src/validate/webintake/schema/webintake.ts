import { z } from 'zod';
import { aardVerzoek, datum, indBestaandeKlant, vrijeTekst, zaakIdentificatie } from './fieldRules';

const vrijCode = z.string().regex(/^[5-9]\d$/, 'Expected a code from 50 to 99');

const berichtsoort = z
  .strictObject({
    WWB: z.strictObject({ Onderwerp: z.enum(['01']), Categorie: z.enum(['01']).optional() }).optional(),
    IOAW: z.strictObject({ Onderwerp: z.enum(['02']), Categorie: z.enum(['02', '03']).optional() }).optional(),
    WMO: z
      .strictObject({ Onderwerp: z.enum(['03']), Categorie: z.enum(['04', '05', '06', '07', '08', '09', '10', '11']).optional() })
      .optional(),
    REI: z.strictObject({ Onderwerp: z.enum(['04']) }).optional(),
    SHV: z.strictObject({ Onderwerp: z.enum(['05']) }).optional(),
    INB: z.strictObject({ Onderwerp: z.enum(['06']) }).optional(),
    VRIJ: z.strictObject({ Onderwerp: vrijCode, Categorie: vrijCode.optional() }).optional(),
  })
  .meta({ choice: true });

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
