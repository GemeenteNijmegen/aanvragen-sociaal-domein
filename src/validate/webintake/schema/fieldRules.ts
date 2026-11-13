import { z } from 'zod';

const noDigits = /^\D*$/;

export const datum = z.string().regex(/^[12]\d{3}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])$/, 'Expected a date as YYYYMMDD');
export const zaakIdentificatie = z.string().max(40);
export const aardVerzoek = z.string().max(2);
export const vrijeTekst = z.string().max(1200);
export const indBestaandeKlant = z.boolean();
export const bsn = z.string().regex(/^\d{9}$/, 'Expected 9 digits');
export const naam = z.string().max(200).regex(noDigits, 'Expected no digits');
export const voorletters = z.string().max(12).regex(noDigits, 'Expected no digits');
export const voorvoegsel = z.string().max(10).regex(noDigits, 'Expected no digits');
export const aanduidingNaamgebruik = z.enum(['0', '1', '2', '3', '4', '5']);
export const geslacht = z.enum(['0', '1', '2', '9']);
export const cdFictieveDatum = z.enum(['0', '1', '2', '3', '4', '5', '6', '7', '8']);
export const iban = z.string().regex(/^[A-Z]{2}\d{2}[a-zA-Z0-9]{1,30}$/, 'Expected an IBAN');
export const bic = z.string().regex(/^[A-Z]{6}[A-Z2-9][A-NP-Z0-9]([A-Z0-9]{3})?$/, 'Expected a BIC');
export const emailAdres = z.string().max(320);
