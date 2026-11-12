# Webintake-validatie

Controleert een Webintake-bericht (JSON) op vorm: velden, verplichte en onbekende velden, volgorde en Berichtsoort. Het bericht wordt één op één naar
XML omgezet, dus de volgorde van de sleutels telt.

validateWebintake gooit nooit en verandert het bericht niet. Uitkomst: valid, invalid of error. Error betekent dat de validator zelf faalde en het
bericht niet beoordeeld is.

## Opbouw

```mermaid
flowchart LR
    In[Webintake JSON] --> Zod[Zod-schema]
    In --> Str[Structuurcontrole]
    Zod --> P[Problemen]
    Str --> P
    P --> Log[Logging]
    P --> R[Resultaat]
```

Het zod-schema controleert per veld type, verplicht, lengte, patroon en toegestane waarden, en meldt onbekende velden. De structuurcontrole loopt
over de ruwe invoer en controleert de volgorde per object en dat er precies één Berichtsoort is. Dat kan niet in zod: een refine op een object draait
niet als een veld al fout is, en zod geeft de sleutels al gesorteerd door. Beide controles draaien altijd, zodat één bericht alle problemen tegelijk
oplevert.

Per object staat de veldvolgorde op één plek (orderedObject). Het zod-schema en de structuurcontrole komen allebei uit die lijst.

Mappen en bestanden: zie [opbouw.md](opbouw.md).

## Berichtstructuur

```mermaid
erDiagram
    Webintake ||--|| Berichtsoort : Berichtsoort
    Webintake ||--|| Client : Client
    Client ||--o| Relatie : Relatie
    Relatie ||--o| Persoon : Partner
    Client ||--o{ Persoon : BijstandspersoonOverig
    Client ||--o| Adres : Correspondentieadres
    Client ||--o| Adres : Feitelijkadres
    Client ||--o{ Telefoonnr : Telefoonnr
    Client ||--o| Nationaliteit : Nationaliteit
```

Precies één (||), optioneel (o|) of een lijst (o{). Persoon zijn de velden van Client zonder Relatie en BijstandspersoonOverig. Feitelijkadres heeft
achteraan nog Wijkcode.

In de diagrammen hieronder is de volgorde van de velden de volgorde in het bericht. Links staat of een veld verplicht, optioneel of een lijst is.

```mermaid
erDiagram
    Webintake {
        verplicht Berichtsoort "precies één soort"
        verplicht Aanvraagdatum "JJJJMMDD"
        optioneel ZaakIdentificatie "max 40"
        optioneel AardVerzoek "max 2"
        optioneel Toelichting "max 1200"
        verplicht Client "Client"
        optioneel IndBestaandeKlant "boolean"
    }
    Relatie {
        verplicht SoortRelatie "1 2 9"
        verplicht Begindatum "JJJJMMDD"
        verplicht CdFictieveBegindat "0 t/m 8"
        optioneel Partner "Persoon"
    }
```

```mermaid
erDiagram
    Client {
        verplicht BurgerServiceNr "9 cijfers"
        optioneel Voornamen "max 200, geen cijfers"
        optioneel Voorletters "max 12, geen cijfers"
        optioneel Voorvoegsel "max 10, geen cijfers"
        verplicht Achternaam "max 200, geen cijfers"
        optioneel AanduidingNaamgebruik "0 t/m 5"
        optioneel VoorvoegselEchtgenoot "max 10, geen cijfers"
        optioneel AchternaamEchtgenoot "max 200, geen cijfers"
        verplicht Geslacht "0 1 2 9"
        verplicht Geboortedatum "JJJJMMDD"
        verplicht CdFictieveGeboortedat "0 t/m 8"
        optioneel Correspondentieadres "Adres"
        optioneel Feitelijkadres "Adres plus Wijkcode"
        optioneel Nationaliteit "Nationaliteit"
        optioneel Iban "IBAN-vorm"
        optioneel Bic "BIC-vorm"
        lijst Telefoonnr "Telefoonnr"
        optioneel EMailAdresClient "max 320"
        optioneel Relatie "Relatie"
        lijst BijstandspersoonOverig "Persoon"
    }
```

```mermaid
erDiagram
    Adres {
        optioneel Locatie "max 35"
        optioneel Straatnaam "max 24"
        optioneel Huisnummer "max 5 cijfers"
        optioneel Huisletter "1 letter"
        optioneel HuisnrToevoeging "max 6"
        optioneel Postcode "1234AB"
        optioneel Woonplaatsnaam "max 80"
        optioneel Gemeentenaam "max 40"
        optioneel Wijkcode "max 2, alleen Feitelijkadres"
    }
    Telefoonnr {
        optioneel Netnr "max 5 cijfers"
        optioneel Abonneenr "max 10 cijfers"
        optioneel TypeTelefoonnr "01 02 03 99"
    }
    Nationaliteit {
        verplicht CdNationaliteit "4 cijfers"
    }
```

Berichtsoort heeft precies één van deze soorten, elk met Onderwerp en waar genoemd een optionele Categorie:

| Soort | Onderwerp | Categorie |
|---|---|---|
| WWB | 01 | 01 |
| IOAW | 02 | 02, 03 |
| WMO | 03 | 04 t/m 11 |
| REI, SHV, INB | 04, 05, 06 | geen |
| VRIJ | 50 t/m 99 | 50 t/m 99 |

## Meldingen en logging

Elk probleem heeft een pad (Client.Relatie.Partner.Geboortedatum), een code en een detail. Codes: missing, unknown_field, order, type, format, length,
not_allowed, choice.

| Niveau | Wanneer | Inhoud |
|---|---|---|
| info | Geldig | Berichtsoort |
| warn | Per probleem en één samenvatting | Pad, code, detail; geen persoonsgegevens |
| debug | Per probleem | Pad en de werkelijke waarde |
| error | Validator faalt | Foutmelding, geen berichtinhoud |

De validator logt via een child van de meegegeven Powertools Logger. De logger van de aanroeper krijgt geen extra sleutels.

Elke regel bevat component en zaakIdentificatie, plus de context die de aanroeper meegeeft. Zo zijn alle regels van één bericht te groeperen.
ZaakIdentificatie komt van de aanroeper, anders uit het bericht, anders unknown. Een waarde staat alleen buiten debug als het veld niet geheim is:
codes, ZaakIdentificatie en Aanvraagdatum.
Onbekende velden komen per object samen in één melding.
