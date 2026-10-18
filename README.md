# NOVA 3D Commerce

NOVA is a Spring Boot and MySQL storefront prototype with a persistent, customer-facing Appearance & Experience panel. Visual preferences live only in browser local storage; they are deliberately separate from server and security configuration.

## Run locally

1. Create a MySQL database called `nova_commerce`.
2. Set `NOVA_DB_URL`, `NOVA_DB_USER`, and `NOVA_DB_PASSWORD` (or edit the development values in `application.yml`).
3. Run `mvn spring-boot:run`.
4. Open `http://localhost:8080`.

The app seeds a small product catalog on first start. The checkout shown in the prototype is explicitly simulated; it does not process a payment.

## Included now

- Live appearance settings with validation, instant CSS-variable updates, local persistence, system-theme support, and Restore Defaults.
- Search, category/price/availability filters, sorting, grid controls, responsive product catalogue, local guest cart, quantity controls, and simulated order confirmation.
- Database-backed product and category REST endpoints with server-side filtering and pageable results.

## Next production steps

Add authenticated carts, payment-provider credentials through environment configuration, order persistence/transactions, image storage, and protected administration endpoints before production use.
