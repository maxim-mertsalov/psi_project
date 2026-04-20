# SmartBuy E-shop - Minimalny project outline pre hodnotenie

Tento dokument je zjednoduseny plan implementacie, aby projekt splnil zadanie predmetu:

- kod je spustitelny na fakultnych PC v IntelliJ IDEA,
- je jasny suvis medzi architekturou, use case-mi a kodom,
- su pripravene akceptacne testy pre `UC1` az `UC4`.

## 1. Co je priorita (a co nie)

### Priorita pre prvu hodnotenu verziu
- `UC1` Vyhladaj a zobraz produkty
- `UC2` Pridaj/uprav/odstran polozky v kosiku
- `UC3` Zadaj udaje a vytvor objednavku
- `UC4` Realizuj online platbu a potvrd platbu

### Nizsia priorita (neskor)
- `UC5` az `UC11` ako rozsirujuci scope
- produkcne hardening temy (full security, observability, advanced devops)

## 2. Minimalny technicky stack (bez overengineeringu)

- Java 21
- Spring Boot 3.x
- Maven
- Spring Web, Spring Data JPA, Validation
- H2 databaza pre lokalny beh a testy (jednoduchy start v skole)
- PostgreSQL volitelne neskor

Poznamka: kvoli jednoduchemu spusteniu na fakultnych PC je H2 default.

## 3. Jednoducha architektura a mapovanie na use case

Pouzijeme modulovy monolit (jedna aplikacia), rozdeleny podla domen:

- `catalog` -> UC1
- `cart` -> UC2
- `checkout` + `order` -> UC3
- `payment` -> UC4
- `shared` -> common chyby, DTO validacia, mapovanie

Navrh struktury:

```text
backend/
  pom.xml
  src/main/java/com/smartbuy/
    SmartBuyApplication.java
    catalog/
    cart/
    checkout/
    order/
    payment/
    shared/
  src/main/resources/
    application.yml
  src/test/java/com/smartbuy/
```

## 4. Priama trasovatelnost: Use case -> API -> kod -> test

| Use case | API endpointy (minimum) | Service vrstva | Akceptacny test |
|---|---|---|---|
| UC1 | `GET /api/products`, `GET /api/products/{id}` | `ProductQueryService` | vyhladavanie + prazdny vysledok + neplatny filter |
| UC2 | `POST /api/cart/items`, `PATCH /api/cart/items/{id}`, `DELETE /api/cart/items/{id}`, `GET /api/cart` | `CartService` | pridanie, zmena mnozstva, nedostatok skladu |
| UC3 | `POST /api/checkout/orders` | `CheckoutService`, `OrderService` | vytvorenie objednavky + rezervacia skladu + guest checkout |
| UC4 | `POST /api/payments/{orderId}/initiate`, `POST /api/payments/callback` | `PaymentService` | uspesna platba, neuspesna platba, duplicitny callback |

Tato tabulka je klucova cast vysvetlenia ku kodu pri odovzdani.

## 5. Akceptacne testy pre UC1-UC4 (minimum)

Pre kazdy use case aspon 2 scenare: hlavny tok + 1 alternativny tok.

- UC1: filter + detail produktu; alternativne `A1` alebo `A2`
- UC2: pridanie/uprava/odstranenie; alternativne `A1`
- UC3: uspesny checkout; alternativne `A2` alebo `A3`
- UC4: uspesna platba callback; alternativne `A1` + idempotencia `A3`

Technicky pristup:
- API acceptance testy cez Spring Boot test + MockMvc alebo WebTestClient
- v testoch pouzit H2 a test data fixture

## 6. Rozdelenie prace pre 4 clenny tim

- Clen 1: UC1 (`catalog`) + testy UC1
- Clen 2: UC2 (`cart`) + testy UC2
- Clen 3: UC3 (`checkout` + `order`) + testy UC3
- Clen 4: UC4 (`payment`) + testy UC4

Spolocne:
- spolocny datovy model a statusy objednavky/platby
- finalny dokument "suvis kodu s architekturou a use case-mi"

## 7. Co musi byt v odovzdani, aby bola cast hodnotitelna

- Spustitelny backend projekt v IntelliJ (`Run` + testy)
- Strucne vysvetlenie architektury a mapovania na use case (`UC1`-`UC4`)
- Akceptacne testy pre `UC1`-`UC4`
- Kratky navod na spustenie (`README.md`)

## 8. Rizika a rozhodnutia na zaciatku

- potvrdit pravidla stavov objednavky a platby (`WAITING_FOR_PAYMENT`, `PAID`, ...)
- potvrdit, ako sa sprava guest checkout v UC3
- zjednotit nejednoznacne nazvy z EA modelu pred implementaciou entit


