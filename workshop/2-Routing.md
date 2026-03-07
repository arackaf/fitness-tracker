# Routing Basics

Docs: [https://tanstack.com/router/latest/docs/routing/file-based-routing#directory-routes](https://tanstack.com/router/latest/docs/routing/file-based-routing#directory-routes)

TanStack supports directory routes, or flat routes. We'll be using directory routes, here, but they're functionally equivalent; it's just a matter of taste. Directory routes are cleaner and clearer in my opinion, and most importantly will be simpler to demo in this workshop.

## Creating routes

Docs: https://tanstack.com/router/latest/docs/routing/routing-concepts
and
https://tanstack.com/router/latest/docs/routing/file-based-routing

## Directory routing

Just put them under the right folder, and name accordingly.

// For the /workouts route
routes/workouts/index.tsx

// For the /workouts/6
routes/workouts/$id.tsx

## Route structure

- Use $xyz for path params
- Use route.tsx for a layout
- Escape route names with `[]`
  - So [route].tsx if you literally want a /route route
- Load data in a loader method
  - Get that data with the Route.useLoaderData() hook
  - Or the `useLoaderData` hook, with the route passed in via `{ from }`

## This list is incomplete, paltry, even

Check the docs, there's a TON of advanced use cases.

There are MANY advanced routing features we won't be pouring over, here
