import { z } from 'zod';
import { gemeentenaam, huisletter, huisnrToevoeging, huisnummer, locatie, postcode, straatnaam, wijkcode, woonplaatsnaam } from './fieldRules';

export const adres = z.strictObject({
  Locatie: locatie.optional(),
  Straatnaam: straatnaam.optional(),
  Huisnummer: huisnummer.optional(),
  Huisletter: huisletter.optional(),
  HuisnrToevoeging: huisnrToevoeging.optional(),
  Postcode: postcode.optional(),
  Woonplaatsnaam: woonplaatsnaam.optional(),
  Gemeentenaam: gemeentenaam.optional(),
});

export const adresWijkcode = adres.extend({ Wijkcode: wijkcode.optional() });
