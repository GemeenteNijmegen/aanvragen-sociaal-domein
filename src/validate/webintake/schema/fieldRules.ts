import { z } from 'zod';

export const datum = z.string().regex(/^[12]\d{3}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])$/, 'Expected a date as YYYYMMDD');
export const zaakIdentificatie = z.string().max(40);
export const aardVerzoek = z.string().max(2);
export const vrijeTekst = z.string().max(1200);
export const indBestaandeKlant = z.boolean();
