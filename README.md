# SmartSpend

SmartSpend is a monthly personal budget planner built with Spring Boot, MySQL,
HTML, CSS, and vanilla JavaScript. The browser UI is served by Spring Boot and
uses the REST API backed by MySQL; it is not a localStorage-only demo.

## Requirements

- Java 8 or newer (Spring Boot 2.7.18)
- Maven 3.6.3 or newer
- MySQL 8.0

## Run locally

1. Start MySQL. The default configuration connects to
   `jdbc:mysql://localhost:3306/smartspend` as `root` with an empty password and
   creates the database if needed.
2. From the project root, run:

   ```sh
   mvn spring-boot:run
   ```

3. Open [http://localhost:8080/](http://localhost:8080/).

Override the defaults with `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD`
environment variables. `PORT` overrides the HTTP port. On first startup, the
application creates the Food, Travel, Shopping, and Education categories if the
category table is empty.

For a quick local run without MySQL, use the temporary in-memory H2 profile:
`mvn spring-boot:run -Dspring-boot.run.profiles=demo`. Demo data is cleared when
the application stops; MySQL remains the default.

Hibernate updates the local schema automatically. Use a disposable development
database; configure managed schema migrations before production.

## Features

- Create, edit, and delete categories (categories with associated budgets or
  expenses cannot be deleted).
- Create and update one monthly allocation per category.
- Record, edit, delete, and filter expenses by category and month.
- Review monthly totals, remaining balances, exceeded amounts, and utilization.
- Get within-budget, approaching-budget, overspending, and no-allocation statuses.
- Record expenses even when the category budget is exceeded.
- View spending mix, allocated-vs-spent, and budget-utilization charts.

## REST API

- `GET`, `POST /api/categories`
- `PUT`, `DELETE /api/categories/{id}`
- `GET /api/budgets?month={1-12}&year={year}`
- `POST /api/budgets`
- `PUT /api/budgets/{id}`
- `GET /api/expenses?month={1-12}&year={year}&categoryId={id}`
- `POST /api/expenses`
- `PUT`, `DELETE /api/expenses/{id}`
- `GET /api/summary?month={1-12}&year={year}`
- `GET /api/summary/category/{categoryId}?month={1-12}&year={year}`

Budget and expense amounts use `BigDecimal` in Java and `DECIMAL(12,2)` in
MySQL. Summary calculations use the expense date and selected month. Categories
without an allocation remain visible and are marked as having no budget.
