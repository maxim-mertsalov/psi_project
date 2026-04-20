# SmartBuy Backend Integration Guide (human + AI)

Tento dokument je zdroj pravdy pre napojenie frontendu na backend.
Je pisany zamerne jednoducho, s dorazom na rychlu implementaciu.

## 1) Scope a architektura

Backend je modulovy monolit v `backend/` (Spring Boot + Maven + JPA + H2).
Domeny su rozdelene takto:

- `catalog` -> produkty a vyhladavanie (`UC1`, `UC7`)
- `cart` -> kosik (`UC2`)
- `checkout` -> vytvorenie objednavky (`UC3`)
- `payment` -> iniciacia platby + callback (`UC4`)
- `customer` -> registracia/prihlasenie (`UC5`, `UC6`)
- `order` -> moje objednavky + administracia spracovania (`UC8`, `UC9`, `UC11`)
- `catalog/admin` -> admin CRUD produktov (`UC10`)
- `shared` -> jednotny error format a custom exception mapovanie

## 2) Integracne pravidla (global)

### Base URL

- lokalne: `http://localhost:8080`
- vsetky endpointy su pod `/api`

### Headers

- `Content-Type: application/json` pre POST/PUT/PATCH
- `X-Session-Id` pre kosik/checkout (guest aj logged user flow)
- `X-Auth-Token` pre endpointy, kde je potrebny login/rola
- `X-Payment-Secret` pre payment callback endpoint

### Error response format

Pri business/validation chybe backend vracia JSON:

```json
{
  "timestamp": "2026-04-20T18:20:11.274Z",
  "status": 409,
  "error": "Conflict",
  "message": "Requested quantity exceeds stock. maxAvailable=5"
}
```

Mapovanie statusov:

- `400 Bad Request` - zly request alebo validacia
- `403 Forbidden` - chyba auth tokenu alebo role
- `404 Not Found` - neexistujuci resource
- `409 Conflict` - konflikt stavu (sklad, order status, duplicate email, ...)

## 3) Auth model (prakticky)

Backend nepouziva JWT. Pouziva per-login session token ulozeny v DB.
Frontend postup:

1. zavolaj `POST /api/auth/register` alebo `POST /api/auth/login`
2. uloz `token` z odpovede
3. posielaj ho v headri `X-Auth-Token`

Role:

- `CUSTOMER`
- `ADMIN`
- `WAREHOUSE`

Seed users (lokalny dev):

- admin: `admin@smartbuy.test` / `admin123`
- warehouse: `warehouse@smartbuy.test` / `warehouse123`

## 4) Session model (cart/checkout)

Kosik je viazany na `X-Session-Id` (string, lubovolny format).
Odporucanie pre frontend:

- pri prvom vstupe vygeneruj UUID
- uloz ho do `localStorage` (napr. `smartbuy_session_id`)
- posielaj ho stale pri `/api/cart/*` a `/api/checkout/orders`

Poznamka: Checkout vie volitelne prijat aj `X-Auth-Token`; vtedy sa order naviaze na account (`ownerEmail`).

## 5) Endpoint contracts

## 5.1 Catalog (UC1, UC7)

### `GET /api/products`

Query params (vsetko optional):

- `q` (string)
- `minPrice` (decimal)
- `maxPrice` (decimal)
- `available` (boolean)

Response `200`:

```json
[
  {
    "id": 1,
    "name": "Phone X1",
    "price": 699.00,
    "available": true,
    "stockAvailable": 20
  }
]
```

Poznamky:

- `minPrice > maxPrice` -> `400`
- triedenie je podla mena vzostupne

### `GET /api/products/{id}`

Response `200`:

```json
{
  "id": 1,
  "name": "Phone X1",
  "description": "Smartphone 8GB RAM, 256GB storage",
  "price": 699.00,
  "available": true,
  "stockAvailable": 20,
  "similarProducts": [
    {
      "id": 2,
      "name": "Phone X2 Pro",
      "price": 899.00,
      "available": true,
      "stockAvailable": 5
    }
  ]
}
```

`404` ak produkt neexistuje.

## 5.2 Cart (UC2)

Vsetky endpointy vyzaduju header `X-Session-Id`.

### `GET /api/cart`

Response `200`:

```json
{
  "cartId": 3,
  "sessionId": "WEB-SESSION-123",
  "items": [
    {
      "itemId": 10,
      "productId": 1,
      "productName": "Phone X1",
      "quantity": 2,
      "unitPriceSnapshot": 699.00,
      "currentUnitPrice": 699.00,
      "priceChanged": false,
      "lineTotal": 1398.00
    }
  ],
  "subtotal": 1398.00
}
```

### `POST /api/cart/items`

Body:

```json
{
  "productId": 1,
  "quantity": 2
}
```

Response: aktualny `CartResponse` (`200`).

Validacie/chyby:

- `quantity >= 1`
- `404` ak produkt neexistuje
- `409` ak nie je dostatok skladu

### `PATCH /api/cart/items/{itemId}`

Body:

```json
{
  "quantity": 3
}
```

Response: aktualny `CartResponse` (`200`).

### `DELETE /api/cart/items/{itemId}`

Response: aktualny `CartResponse` (`200`).

## 5.3 Checkout (UC3)

### `POST /api/checkout/orders`

Headers:

- required: `X-Session-Id`
- optional: `X-Auth-Token`

Body:

```json
{
  "guestEmail": "guest@example.com",
  "shippingMethod": "COURIER",
  "shippingPrice": 10.00,
  "paymentMethod": "ONLINE_CARD",
  "address": {
    "street": "Main 1",
    "city": "Bratislava",
    "zipCode": "81101",
    "country": "SK"
  }
}
```

Response `200`:

```json
{
  "orderId": 5,
  "orderNumber": "SB-1A2B3C4D",
  "status": "WAITING_FOR_PAYMENT",
  "totalAmount": 1408.00
}
```

Business pravidla:

- prazdny kosik -> `400`
- pred vytvorenim objednavky prebehne re-validacia skladu aj ceny
- zmena ceny pocas checkoutu -> `409`
- produkt sa medzicasom vypredal -> `409`
- po uspesnom checkout sa kosik vycisti a sklad sa rezervuje (`quantityReserved`)

## 5.4 Payments (UC4)

### `POST /api/payments/{orderId}/initiate`

Response `200`:

```json
{
  "paymentId": 9,
  "externalReference": "PAY-123456ABCD",
  "redirectUrl": "https://example-gateway/pay/PAY-123456ABCD",
  "status": "INITIATED"
}
```

Pravidlo: order musi byt v stave `WAITING_FOR_PAYMENT`, inak `400`.

### `POST /api/payments/callback`

Header:

- `X-Payment-Secret: smartbuy-dev-secret` (dev default)

Body:

```json
{
  "externalReference": "PAY-123456ABCD",
  "result": "SUCCESS"
}
```

`result` podporuje:

- `SUCCESS`
- `FAILED`
- `CANCELLED`

Response `200`:

```json
{
  "status": "OK",
  "message": "Payment marked as successful"
}
```

Idempotencia callbacku:

- ak je transakcia uz terminalna, vrati sa:

```json
{
  "status": "IGNORED_DUPLICATE",
  "message": "Terminal state already processed"
}
```

## 5.5 Auth (UC5, UC6)

### `POST /api/auth/register`

Body:

```json
{
  "name": "Test User",
  "email": "test@smartbuy.test",
  "password": "secret123"
}
```

Response `200`:

```json
{
  "accountId": 11,
  "name": "Test User",
  "email": "test@smartbuy.test",
  "role": "CUSTOMER",
  "token": "uuid-token"
}
```

Chyby:

- `409` pri duplicitnom emaile
- `400` pri nevalidnych datach

### `POST /api/auth/login`

Body:

```json
{
  "email": "test@smartbuy.test",
  "password": "secret123"
}
```

Response: rovnaky `AuthResponse` ako register.

Chyba: `403` pri zlom mene/hesle.

## 5.6 Customer orders (UC8, UC9)

Vyzaduje `X-Auth-Token` customer uctu.

### `GET /api/me/orders`

Response `200`:

```json
[
  {
    "orderId": 5,
    "orderNumber": "SB-1A2B3C4D",
    "status": "WAITING_FOR_PAYMENT",
    "totalAmount": 1408.00,
    "createdAt": "2026-04-20T18:30:00Z",
    "ownerEmail": "test@smartbuy.test",
    "guestEmail": "test@smartbuy.test"
  }
]
```

### `POST /api/me/orders/{orderId}/cancel`

Response `200`:

```json
{
  "orderId": 5,
  "status": "CANCELLED",
  "message": "Order cancelled"
}
```

Pravidla:

- customer moze rusit len svoje ordery
- `SHIPPED` alebo uz `CANCELLED` order sa neda zrusit (`409`)
- pri zruseni sa uvolni rezervovany sklad

## 5.7 Admin products (UC10)

Vyzaduje `X-Auth-Token` role `ADMIN`.

### `GET /api/admin/products`

Response `200`: list `AdminProductResponse`.

### `POST /api/admin/products`

Body:

```json
{
  "name": "Tablet Pro",
  "description": "10 inch tablet",
  "price": 499.00,
  "available": true,
  "categoryId": 1,
  "stockQuantity": 12
}
```

Response `200`:

```json
{
  "id": 100,
  "name": "Tablet Pro",
  "description": "10 inch tablet",
  "price": 499.00,
  "available": true,
  "category": "Telefony",
  "stockQuantity": 12
}
```

### `PUT /api/admin/products/{productId}`

Body rovnaky ako create, response `200` (`AdminProductResponse`).

### `DELETE /api/admin/products/{productId}`

Response `200` bez tela.

## 5.8 Admin/Warehouse order processing (UC11)

Vyzaduje `X-Auth-Token` role `ADMIN` alebo `WAREHOUSE`.

### `POST /api/admin/orders/{orderId}/process`

Pravidlo: order musi byt `PAID`, potom sa prepne na `PROCESSING`.

Response `200`:

```json
{
  "orderId": 5,
  "status": "PROCESSING",
  "message": "Order moved to processing"
}
```

### `POST /api/admin/orders/{orderId}/ship`

Pravidlo: order musi byt `PROCESSING`, potom `SHIPPED`.

Response `200`:

```json
{
  "orderId": 5,
  "status": "SHIPPED",
  "message": "Order shipped"
}
```

## 6) Stavove automaty (dolezite pre frontend)

### OrderStatus

`WAITING_FOR_PAYMENT -> PAID -> PROCESSING -> SHIPPED`

Mozny bocny prechod:

- `WAITING_FOR_PAYMENT/PAID/PROCESSING -> CANCELLED` (customer cancel, s pravidlami)

### PaymentStatus

`INITIATED -> SUCCESSFUL | FAILED | CANCELLED`

Pri `SUCCESSFUL` sa order prepne na `PAID`.
Pri `FAILED`/`CANCELLED` order ostava `WAITING_FOR_PAYMENT`.

## 7) Use case trasovatelnost (kod -> API -> test)

| UC | API | Implementacia | Acceptance test |
|---|---|---|---|
| UC1 | `GET /api/products`, `GET /api/products/{id}` | `catalog/ProductController`, `catalog/ProductQueryService` | `AcceptanceUc1Uc4Test.uc1_*` |
| UC2 | `GET/POST/PATCH/DELETE /api/cart...` | `cart/CartController`, `cart/CartService` | `AcceptanceUc1Uc4Test.uc2_*` |
| UC3 | `POST /api/checkout/orders` | `checkout/CheckoutController`, `checkout/CheckoutService` | `AcceptanceUc1Uc4Test.uc3_*` |
| UC4 | `POST /api/payments/{id}/initiate`, `POST /api/payments/callback` | `payment/PaymentController`, `payment/PaymentService` | `AcceptanceUc1Uc4Test.uc4_*` |
| UC5-UC6 | `POST /api/auth/register`, `POST /api/auth/login` | `customer/AuthController`, `customer/AuthService` | `AcceptanceUc5Uc11Test.uc5_*` |
| UC8-UC9 | `GET /api/me/orders`, `POST /api/me/orders/{id}/cancel` | `order/OrderController`, `order/OrderService` | `AcceptanceUc5Uc11Test.uc8_and_uc9_*` |
| UC10 | `/api/admin/products` CRUD | `catalog/AdminProductController`, `catalog/AdminProductService` | `AcceptanceUc5Uc11Test.uc10_*` |
| UC11 | `/api/admin/orders/{id}/process`, `/ship` | `order/AdminOrderController`, `order/OrderService` | `AcceptanceUc5Uc11Test.uc11_*` |

## 8) Data model (minimum pre FE pochopenie)

Klucove entity:

- `Product` + `Category`
- `StockItem` (`quantityOnHand`, `quantityReserved`, `available = onHand - reserved`)
- `Cart` + `CartItem` (drzi `unitPriceSnapshot`)
- `OrderEntity` + `OrderItem` + `Address`
- `PaymentTransaction`
- `Account` + `AccountSession`

Dolezite: kosik a checkout pracuju s price snapshotom, aby sa zachytila zmena ceny medzi pridanim do kosika a potvrdenim objednavky.

## 9) Frontend integration checklist

- [ ] Drzat stabilny `X-Session-Id` (localStorage)
- [ ] Po login/register ulozit `X-Auth-Token`
- [ ] Pri kazdom requeste citat `status` + `message` aj pre chyby
- [ ] V kosiku zobrazovat `priceChanged` (ak true, upozornit usera)
- [ ] Po checkout presmerovat usera na payment flow (`/api/payments/{orderId}/initiate`)
- [ ] Pri profile zobrazit moje objednavky z `GET /api/me/orders`
- [ ] Admin sekcie oddelit podla role

## 10) Machine-readable quick contract (AI shortcut)

```yaml
apiVersion: "smartbuy-v1"
baseUrl: "http://localhost:8080"
headers:
  session: "X-Session-Id"
  auth: "X-Auth-Token"
  paymentCallbackSecret: "X-Payment-Secret"
resources:
  products:
    list: "GET /api/products"
    detail: "GET /api/products/{id}"
  cart:
    get: "GET /api/cart"
    addItem: "POST /api/cart/items"
    updateItem: "PATCH /api/cart/items/{itemId}"
    removeItem: "DELETE /api/cart/items/{itemId}"
  checkout:
    createOrder: "POST /api/checkout/orders"
  payments:
    initiate: "POST /api/payments/{orderId}/initiate"
    callback: "POST /api/payments/callback"
  auth:
    register: "POST /api/auth/register"
    login: "POST /api/auth/login"
  myOrders:
    list: "GET /api/me/orders"
    cancel: "POST /api/me/orders/{orderId}/cancel"
  adminProducts:
    list: "GET /api/admin/products"
    create: "POST /api/admin/products"
    update: "PUT /api/admin/products/{productId}"
    delete: "DELETE /api/admin/products/{productId}"
  adminOrders:
    process: "POST /api/admin/orders/{orderId}/process"
    ship: "POST /api/admin/orders/{orderId}/ship"
```

## 11) Lokalny run a test

```powershell
cd backend
.\mvnw.cmd test
.\mvnw.cmd spring-boot:run
```

Ak chcete rychly smoke check po starte:

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/products"
```

## 12) End-to-end flow playbooks (for frontend implementation)

Tieto flow su zladene s acceptance testami a su vhodne ako FE backlog.

### Flow A: Guest checkout + online payment success (UC1-UC4)

1. `GET /api/products` a `GET /api/products/{id}`
2. `POST /api/cart/items` (s `X-Session-Id`)
3. `GET /api/cart` (render kosik)
4. `POST /api/checkout/orders` (bez `X-Auth-Token`, ale s `guestEmail`)
5. `POST /api/payments/{orderId}/initiate`
6. Presmerovanie usera na `redirectUrl`
7. (simulacia brany) `POST /api/payments/callback` s `result=SUCCESS`
8. Order je `PAID` a moze ist do internych krokov spracovania

### Flow B: Registered customer order history and cancel (UC5/UC6/UC8/UC9)

1. `POST /api/auth/register` alebo `POST /api/auth/login`
2. Ulozit `token` ako `X-Auth-Token`
3. Spravit checkout s rovnakym `X-Session-Id` + `X-Auth-Token`
4. `GET /api/me/orders`
5. `POST /api/me/orders/{orderId}/cancel` (ak order este dovoluje cancel)

### Flow C: Admin catalog management (UC10)

1. Admin login (`admin@smartbuy.test`)
2. `GET /api/admin/products`
3. `POST /api/admin/products` (create)
4. `PUT /api/admin/products/{productId}` (edit)
5. `DELETE /api/admin/products/{productId}` (remove)

### Flow D: Warehouse/Admin fulfillment (UC11)

1. Order musi byt najprv `PAID`
2. `POST /api/admin/orders/{orderId}/process` -> `PROCESSING`
3. `POST /api/admin/orders/{orderId}/ship` -> `SHIPPED`

## 13) Role and endpoint access matrix

| Endpoint group | Guest | CUSTOMER | ADMIN | WAREHOUSE |
|---|---|---|---|---|
| `GET /api/products`, `GET /api/products/{id}` | yes | yes | yes | yes |
| `/api/cart/**` | yes (`X-Session-Id`) | yes (`X-Session-Id`) | yes | yes |
| `POST /api/checkout/orders` | yes (`X-Session-Id`) | yes (`X-Session-Id` + optional token) | yes | yes |
| `POST /api/payments/{orderId}/initiate` | yes | yes | yes | yes |
| `POST /api/payments/callback` | gateway-only (`X-Payment-Secret`) | gateway-only | gateway-only | gateway-only |
| `/api/auth/register`, `/api/auth/login` | yes | yes | yes | yes |
| `/api/me/orders/**` | no | yes | no | no |
| `/api/admin/products/**` | no | no | yes | no |
| `/api/admin/orders/**` | no | no | yes | yes |

## 14) Validation and business constraints catalog

Toto je prakticky zoznam pravidiel, ktore ma FE validovat dopredu (plus stale ratat s BE chybou).

### Input validation (DTO level)

- register:
  - `name`: required
  - `email`: valid email
  - `password`: required, min length 4
- login:
  - `email`: valid email
  - `password`: required
- cart:
  - add item `quantity >= 1`
  - update item `quantity >= 1`
- checkout:
  - `shippingMethod`: required
  - `shippingPrice >= 0`
  - `paymentMethod`: required
  - `address.street/city/zipCode/country`: required
  - `guestEmail`: valid email (ak posielane)
- admin product upsert:
  - `name`: required
  - `price >= 0`
  - `categoryId`: required
  - `stockQuantity >= 0`

### Business constraints (service level)

- product filter: `minPrice <= maxPrice`, inak `400`
- cart add/update: requested qty nesmie presiahnut available stock, inak `409`
- checkout:
  - cart nesmie byt prazdny (`400`)
  - pred ulozenim sa kontroluje dostupnost aj price snapshot (`409`)
- payment initiate: order musi byt `WAITING_FOR_PAYMENT` (`400`)
- payment callback:
  - musi sediet `X-Payment-Secret` (`400`)
  - duplicate callback je idempotentny (`IGNORED_DUPLICATE`)
- my order cancel:
  - customer moze rusit len vlastny order
  - `SHIPPED` a `CANCELLED` sa neda rusit (`409`)
- admin process/ship:
  - process len z `PAID`
  - ship len z `PROCESSING`

## 15) Status transition rules (strict)

### Order status transitions

- `WAITING_FOR_PAYMENT -> PAID` (payment callback `SUCCESS`)
- `PAID -> PROCESSING` (`POST /api/admin/orders/{id}/process`)
- `PROCESSING -> SHIPPED` (`POST /api/admin/orders/{id}/ship`)
- `WAITING_FOR_PAYMENT|PAID|PROCESSING -> CANCELLED` (customer cancel, ak pravidla dovolia)

Zakazane prechody vracaju `409`.

### Payment status transitions

- `INITIATED -> SUCCESSFUL`
- `INITIATED -> FAILED`
- `INITIATED -> CANCELLED`
- Terminalny stav (`SUCCESSFUL|FAILED|CANCELLED`) je finalny

## 16) Ready-to-use API snippets (PowerShell)

Tieto priklady su copy/paste na rychly manualny integration test.

```powershell
# 1) products
Invoke-RestMethod -Method Get -Uri "http://localhost:8080/api/products"

# 2) add to cart
$sessionId = "DEMO-SESSION-1"
Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/cart/items" `
  -Headers @{"X-Session-Id"=$sessionId} `
  -ContentType "application/json" `
  -Body '{"productId":1,"quantity":1}'

# 3) checkout (guest)
$checkout = Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/checkout/orders" `
  -Headers @{"X-Session-Id"=$sessionId} `
  -ContentType "application/json" `
  -Body '{"guestEmail":"guest@example.com","shippingMethod":"COURIER","shippingPrice":10.00,"paymentMethod":"ONLINE_CARD","address":{"street":"Main 1","city":"Bratislava","zipCode":"81101","country":"SK"}}'

$orderId = $checkout.orderId

# 4) initiate payment
$payment = Invoke-RestMethod -Method Post -Uri ("http://localhost:8080/api/payments/{0}/initiate" -f $orderId)

# 5) callback success (gateway simulation)
Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/payments/callback" `
  -Headers @{"X-Payment-Secret"="smartbuy-dev-secret"} `
  -ContentType "application/json" `
  -Body ("{{\"externalReference\":\"{0}\",\"result\":\"SUCCESS\"}}" -f $payment.externalReference)
```

## 17) Known limitations and frontend implications

- API nema OpenAPI/Swagger export; tento dokument je aktualne contract source.
- `POST /api/payments/{orderId}/initiate` nema auth guard; FE ma endpoint pouzivat iba z order detail/checkout flow.
- Nema samostatny endpoint na detail objednavky; FE momentalne pracuje so summary listom z `GET /api/me/orders`.
- Password hashing je jednoduchy SHA-256 (studentsky scope), nie production-grade auth.
- H2 je in-memory default, data sa po restarte resetnu; FE test scenare treba robit v jednej session app behu.



