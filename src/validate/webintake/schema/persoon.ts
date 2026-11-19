import { z } from 'zod';
import { adres, adresWijkcode } from './adres';
import {
  aanduidingNaamgebruik,
  abonneenr,
  bic,
  bsn,
  cdFictieveDatum,
  cdNationaliteit,
  datum,
  emailAdres,
  geslacht,
  iban,
  naam,
  netnr,
  soortRelatie,
  typeTelefoonnr,
  voorletters,
  voorvoegsel,
} from './fieldRules';

const telefoonnr = z.strictObject({ Netnr: netnr.optional(), Abonneenr: abonneenr.optional(), TypeTelefoonnr: typeTelefoonnr.optional() });
const nationaliteit = z.strictObject({ CdNationaliteit: cdNationaliteit });

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
  Feitelijkadres: adresWijkcode.optional(),
  Nationaliteit: nationaliteit.optional(),
  Iban: iban.optional(),
  Bic: bic.optional(),
  Telefoonnr: z.array(telefoonnr).optional(),
  EMailAdresClient: emailAdres.optional(),
});

const relatie = z.strictObject({
  SoortRelatie: soortRelatie,
  Begindatum: datum,
  CdFictieveBegindat: cdFictieveDatum,
  Partner: persoon.optional(),
});

export const client = persoon.extend({
  Relatie: relatie.optional(),
  BijstandspersoonOverig: z.array(persoon).optional(),
});
