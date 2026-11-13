# Nieuwe validator

Een validator is een klasse die MessageValidator implementeert. De gedeelde logica zit in validateMessage, dus er is geen basisklasse om van te
erven. Een nieuwe validator is een eigen map met een schema en een klasse. Webintake is het voorbeeld.

```
src/validate/<bericht>/
  README.md                 wat er gecontroleerd wordt
  docs/                     overige markdown, alleen als die er is
  <Bericht>Validator.ts     de klasse
  schema/                   zod-schema
  test/                     één testbestand met functionele scenario's
```

Schrijf het schema in gewone zod en voeg geen eigen hulpmiddelen toe voor iets wat zod al kan (zie [technische keuzes](technische-keuzes.md)).
Telt de volgorde niet, dan is dit alles:

```ts
const definition: MessageDefinition = {
  name: 'Voorbeeld',
  component: 'voorbeeld-validation',
  schema: z.strictObject({ Kenmerk: z.string().max(40), Datum: z.string() }),
  groupingKey: (message) => ({ kenmerk: z.looseObject({ Kenmerk: z.string() }).safeParse(message).data?.Kenmerk ?? 'unknown' }),
};

/**
 * Validates a Voorbeeld message.
 *
 * Default grouping key: `kenmerk` from the message, or `unknown` when it is missing. Pass logKeys only to override it.
 */
export class VoorbeeldValidator implements MessageValidator {
  validate(input: unknown, options: ValidationOptions): ValidationResult {
    return validateMessage(input, definition, options);
  }
}
```

Geef in groupingKey een standaardsleutel uit het bericht waarmee alle logregels van één bericht te groeperen zijn, met unknown als het bericht hem
niet heeft. De aanroeper kan hem overschrijven met logKeys in de opties. Noem de standaard in de JSDoc van de klasse, zodat een aanroeper weet of
hij logKeys moet meegeven. Hoort het bericht bij een zaak, gebruik dan zaakIdentificatie: dan zijn de logs van verschillende validators voor
dezelfde zaak samen te zoeken.

Telt de volgorde wel, zet dan checkOrder: true in de definitie, zoals in webintake/WebintakeValidator.ts. De verwachte volgorde is de volgorde
waarin de velden in het schema staan, in elk object. Optionele velden en arrays tellen mee; een object binnen bijvoorbeeld .nullable() niet.

De klasse importeert MessageValidator, ValidationOptions en ValidationResult uit MessageValidator.ts, MessageDefinition en validateMessage uit
validateMessage.ts. Een validator importeert niets uit code buiten src/validate, en code buiten src/validate importeert alleen de klasse.
