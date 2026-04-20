# SmartBuy Roadmap

This document is the working roadmap for the rest of the project.
It is written to be usable by both humans and AI tools.

## 0. Current baseline

The project already has:

- EA model export documentation in `docs/ea-model/`
- a minimal but runnable Spring Boot backend in `backend/`
- acceptance tests covering `UC1` to `UC4`
- additional backend support for `UC5` to `UC11`
- H2-based local execution for school PCs and IntelliJ

This means the next work is mostly:

- stabilizing the backend
- improving traceability between use cases, code, and tests
- preparing the frontend contract and project presentation
- cleaning up edge cases and project documentation

---

## 1. Project goals for the next phase

### Goal A: Make the backend presentation-ready
The backend should be easy to run, easy to explain, and easy to test.

### Goal B: Keep traceability clear
Every use case should map to:

- API endpoint(s)
- service class(es)
- domain class(es)
- acceptance test(s)

### Goal C: Make frontend development straightforward
The backend API should be stable enough for frontend students to consume without guessing.

### Goal D: Finish the project in a team-friendly way
Work should be split into independent slices so four people can work in parallel.

---

## 2. Use case to module map

| Use case | Module(s) | Main responsibility |
|---|---|---|
| UC1 | `catalog` | search, filtering, product detail |
| UC2 | `cart` | add/update/remove cart items |
| UC3 | `checkout`, `order` | create order, reserve stock, guest checkout |
| UC4 | `payment` | initiate payment, callback handling, idempotency |
| UC5 | `customer` | registration |
| UC6 | `customer` | login, token issuance |
| UC7 | `catalog` | product detail reuse |
| UC8 | `order`, `customer` | list own orders |
| UC9 | `order`, `customer` | cancel own order |
| UC10 | `catalog` | admin product CRUD |
| UC11 | `order`, `catalog` | order processing and shipping |

---

## 3. Recommended work order

### Phase 1 - Stabilize the current backend
Priority: highest

Deliverables:

- verify all acceptance tests run cleanly
- check that all API contracts are consistent
- review edge cases and error handling
- confirm seeded data is enough for demos
- update README with run instructions and endpoints

Exit criteria:

- backend starts in IntelliJ
- `mvn test` passes
- API responses are stable enough for frontend and demonstration

---

### Phase 2 - Finalize UC8-UC11 integration
Priority: high

Focus:

- customer order listing
- customer order cancellation
- admin product management
- warehouse/admin order processing
- role/token checks for protected endpoints

Deliverables:

- acceptance tests for customer and admin flows
- clear authorization rules in docs
- confirmation that registered checkout can be linked to order ownership

Exit criteria:

- UC8, UC9, UC10, UC11 can be demonstrated from HTTP endpoints
- customer/admin permissions behave correctly

---

### Phase 3 - Frontend contract and API cleanup
Priority: medium

Focus:

- finalize endpoint naming and request/response shapes
- ensure DTO names are clear
- document sample request payloads
- identify which endpoints frontend will call first

Deliverables:

- API summary document for frontend teammates
- sample payloads for all main flows
- list of required headers:
  - `X-Session-Id`
  - `X-Auth-Token`
  - `X-Payment-Secret`

Exit criteria:

- frontend team can build pages without backend guesswork

---

### Phase 4 - Documentation and grading package
Priority: medium

Focus:

- project explanation
- architecture/use-case traceability
- final demo checklist
- short slides or notes for presentation

Deliverables:

- `docs/project-outline.md`
- `docs/roadmap.md`
- optional `docs/api-contract.md`
- final README polish

Exit criteria:

- all team members can explain what their part does
- grading evidence is easy to show

---

## 4. Team split for 4 people

This is a suggested ownership model.
It can be adjusted, but it is a good default split.

### Person 1 - Catalog and search owner
Responsible for:

- UC1
- UC7
- UC10 product CRUD part
- product DTOs and filtering logic
- catalog-related tests

### Person 2 - Cart and checkout owner
Responsible for:

- UC2
- UC3
- stock reservation logic
- checkout payload validation
- order creation flow
- cart/checkout tests

### Person 3 - Payment and customer auth owner
Responsible for:

- UC4
- UC5
- UC6
- token/session handling
- payment callback flow
- auth/payment tests

### Person 4 - Orders, admin flow, and integration owner
Responsible for:

- UC8
- UC9
- UC11
- role checks
- order status transitions
- integration test orchestration
- documentation coordination

---

## 5. Suggested implementation slices

### Slice 1 - Public shopping flow
Includes:

- product search
- product detail
- cart
- checkout
- payment initiation

Acceptance coverage:

- UC1
- UC2
- UC3
- UC4

### Slice 2 - Customer account flow
Includes:

- registration
- login
- own order list
- cancel own order

Acceptance coverage:

- UC5
- UC6
- UC8
- UC9

### Slice 3 - Admin and warehouse flow
Includes:

- admin product CRUD
- warehouse/admin order processing
- shipping transitions

Acceptance coverage:

- UC10
- UC11

---

## 6. Testing strategy

### Unit/service tests
Use for:

- validation rules
- state transitions
- permission checks
- stock availability logic
- duplicate callback handling

### Acceptance tests
Use for:

- full HTTP flow coverage
- end-to-end scenario verification
- demonstrating that the backend matches the use cases

### Recommended acceptance test groups

- `AcceptanceUc1Uc4Test`
- `AcceptanceUc5Uc11Test`

### Minimum scenarios per use case

- UC1: search, empty result, invalid filter, product detail
- UC2: add, update, remove, stock conflict
- UC3: successful checkout, unavailable during checkout, guest checkout
- UC4: success, failed, duplicate callback
- UC5: register, duplicate email, invalid password
- UC6: login success, login failure
- UC8: list own orders, empty list
- UC9: cancel order, cancel forbidden after shipment/cancelled
- UC10: create/update/delete product, forbidden for customer
- UC11: process order, ship order, role restriction

---

## 7. Integration points to keep stable

The following contracts should not change often:

- `POST /api/cart/items`
- `POST /api/checkout/orders`
- `POST /api/payments/{orderId}/initiate`
- `POST /api/payments/callback`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/me/orders`
- `POST /api/me/orders/{orderId}/cancel`
- `GET /api/admin/products`
- `POST /api/admin/orders/{orderId}/process`
- `POST /api/admin/orders/{orderId}/ship`

Headers to keep stable:

- `X-Session-Id`
- `X-Auth-Token`
- `X-Payment-Secret`

---

## 8. Definition of done

A task is done when:

- the code compiles
- tests pass
- the use case is traceable in docs
- the API is understandable from the request/response shape
- the feature can be demonstrated in IntelliJ on the school PC
- the team can explain why the design matches the EA model

---

## 9. Best next action for the team

If the team wants the most efficient next step, do this order:

1. lock the API contract
2. freeze the acceptance tests
3. finish any missing service logic
4. polish README and roadmap docs
5. prepare frontend screens based on the stable endpoints

---

## 10. AI-friendly summary

If another AI tool reads this repo, the most important facts are:

- the project is a Spring Boot backend for SmartBuy
- the core commerce flow is already implemented
- the remaining work is mainly stabilization, documentation, and demo readiness
- use cases map directly to modules and HTTP endpoints
- acceptance tests are the primary proof of correctness

