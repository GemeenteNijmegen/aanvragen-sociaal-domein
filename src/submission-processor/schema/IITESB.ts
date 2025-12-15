import { z } from 'zod';

const fileObjectSchema = z.object({
  bucket: z.string(),
  objectKey: z.string(),
  fileName: z.string(),
  objectType: z.string().optional(),
});

const persoonsgegevensSchema = z.object({
  Voornamen: z.string().optional(),
  Voorletters: z.string().optional(),
  Voorvoegsel: z.string().optional(),
  Achternaam: z.string(),
  Geslachtsnaam: z.string(),
  Geslacht: z.string(),
  Geboortedatum: z.string(),
});

const adresSchema = z.object({
  Straat: z.string().optional(),
  Huisnummer: z.string().optional(),
  Postcode: z.string().optional(),
  Woonplaats: z.string().optional(),
  Gemeente: z.string().optional(),
});

export const persoonSchema = z.object({
  Persoonsgegevens: persoonsgegevensSchema,
  Adres: adresSchema.optional(), // hele Adres-blok optioneel
});

export const iitEsbSchema = z.object({
  bsn: z.string(),
  kvknummer: z.string().optional(),
  formName: z.string().optional(),
  reference: z.string(),
  inlogmiddel: z.string(),
  fileObjects: z.array(fileObjectSchema),
  brpData: z.object({
    Persoon: persoonSchema,
  }).optional(),
});

export type iitEsb = z.infer<typeof iitEsbSchema>;
export type iitPersoon = z.infer<typeof persoonSchema>;
