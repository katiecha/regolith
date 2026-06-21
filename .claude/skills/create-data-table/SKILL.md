---
description: Builds a server-driven data table with filtering, sorting, and pagination
user-invocable: true
tags: [scaffold]
---

# Create Data Table

Build server-driven data tables.

## Backend

* Define query handler
* Support:

  * filtering
  * sorting
  * pagination

## Frontend

* Define columns:

```ts
{
  id: "name",
  label: "Name",
  sortable: true,
}
```

## Rules

* Server is source of truth
* No client-side filtering for large datasets
* Query must be:

  * paginated
  * optimized
  * scoped correctly

## Features

* sorting
* filtering
* selection
* export (optional)

## Anti-Patterns

* loading all rows then filtering
* client-side joins
* unbounded queries
