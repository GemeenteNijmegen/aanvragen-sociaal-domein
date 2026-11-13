# Webintake-validatie

WebintakeValidator controleert een Webintake-bericht (JSON) op vorm: velden, verplichte en onbekende velden, volgorde en Berichtsoort. Het bericht
wordt één op één omgezet, dus de volgorde van de sleutels telt. Gebruik en gedrag: [validatie](../README.md). Waarom zod plus een eigen
volgordecontrole: [technische keuzes](../docs/technische-keuzes.md). Mappen en bestanden: [opbouw](docs/opbouw.md).

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

SoortRelatie: 1 huwelijk, 2 geregistreerd partnerschap, 9 anders. CdFictieveGeboortedat en CdFictieveBegindat zeggen welk deel van de datum
ervoor fictief is: 0 geen, 1 dag, 2 maand, 3 dag en maand, 4 jaar, 5 dag en jaar, 6 maand en jaar, 7 dag, maand en jaar, 8 onbekend welke delen.

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

Het pad begint bij Webintake, bijvoorbeeld Client.Relatie.Partner.Geboortedatum. Een probleem op Webintake zelf, zoals een onbekend veld bovenaan,
heeft als pad Webintake. Codes: die van zod (zoals too_big, invalid_value, unrecognized_keys), plus missing, order en choice (Berichtsoort heeft
niet precies één soort).

| Niveau | Wanneer | Inhoud |
|---|---|---|
| info | Geldig | Webintake valid, met de vaste sleutels |
| warn | Per probleem en één samenvatting | Pad, code, detail en limit, geen persoonsgegevens |
| debug | Per probleem | Pad en de werkelijke waarde |
| error | Validator faalt | Foutmelding, geen berichtinhoud |

Elke regel heeft component webintake-validation en zaakIdentificatie, zodat alle regels van één bericht te groeperen zijn. ZaakIdentificatie komt
uit het bericht, anders unknown. De aanroeper kan hem overschrijven met logKeys.
