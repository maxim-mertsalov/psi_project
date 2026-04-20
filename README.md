# PSI Project - SmartBuy E-shop

This repository contains:

- Enterprise Architect export in `html/`
- generated documentation in `docs/`
- runnable Spring Boot backend in `backend/`

## What is implemented now

- `UC1` product search and product detail
- `UC2` cart add / update / remove
- `UC3` checkout and order creation
- `UC4` payment initiation and callback confirmation
- `UC5` registration
- `UC6` login
- `UC8` customer order list and cancel
- `UC10` admin product CRUD
- `UC11` admin/warehouse order processing
- acceptance tests for `UC1`-`UC4` and `UC5`-`UC11`

## Project artifacts for traceability

- Human-readable model digest: `docs/ea-model/ea-model-digest.md`
- AI-friendly structured model JSON: `docs/ea-model/ea-model.json`
- Minimal architecture outline: `docs/project-outline.md`
- Team roadmap: `docs/roadmap.md`
- Extraction script: `scripts/extract_ea_model.py`

## How to run the backend

Use the Maven Wrapper in `backend/` so you do not need a system Maven install:

```powershell
cd backend
.\mvnw.cmd test
```

For IntelliJ IDEA:

1. Open the `backend/` folder as a Maven project.
2. Ensure the project SDK is Java 21.
3. Run `SmartBuyApplication` or the acceptance test classes.

### Main API groups

- Public catalog: `/api/products`
- Cart: `/api/cart`
- Checkout: `/api/checkout/orders`
- Payment: `/api/payments/...`
- Auth: `/api/auth/register`, `/api/auth/login`
- Customer orders: `/api/me/orders`
- Admin catalog: `/api/admin/products`
- Admin orders: `/api/admin/orders`

## Regenerate model docs

```powershell
python .\scripts\extract_ea_model.py
```

## Notes

- The backend uses H2 by default for easy local execution on faculty computers.
- The implementation is intentionally modular monolith style so the code maps cleanly to the UML/use cases.

