import { z } from 'zod';
import {
  aanduidingNaamgebruik,
  bic,
  bsn,
  cdFictieveDatum,
  datum,
  emailAdres,
  geslacht,
  iban,
  naam,
  voorletters,
  voorvoegsel,
} from './fieldRules';

const adres = z.looseObject({});
const telefoonnr = z.looseObject({});
const nationaliteit = z.looseObject({});
const relatie = z.looseObject({});

export const persoon = z.strictObject({
  BurgerServiceNr: bsn,
  Voornamen: naam.optional(),
  Voorletters: voorletters.optional(),
  Voorvoegsel: voorvoegsel.optional(),
  Achternaam: naam,
  AanduidingNaamgebruik: aanduidingNaamgebruik.optional(),
  VoorvoegselEchtgenoot: voorvoegsel.optional(),
  AchternaamEchtgenoot: naam.optional(),
  Geslacht: geslacht,
  Geboortedatum: datum,
  CdFictieveGeboortedat: cdFictieveDatum,
  Correspondentieadres: adres.optional(),
  Feitelijkadres: adres.optional(),
  Nationaliteit: nationaliteit.optional(),
  Iban: iban.optional(),
  Bic: bic.optional(),
  Telefoonnr: z.array(telefoonnr).optional(),
  EMailAdresClient: emailAdres.optional(),
});

export const client = persoon.extend({
  Relatie: relatie.optional(),
  BijstandspersoonOverig: z.array(z.looseObject({})).optional(),
});
