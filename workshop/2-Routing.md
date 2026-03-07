# Routing

Docs: [https://tanstack.com/router/latest/docs/routing/file-based-routing#directory-routes](https://tanstack.com/router/latest/docs/routing/file-based-routing#directory-routes)

TanStack supports directory routes, or flat routes. We'll be using directory routes, here, but they're functionally equivalent; it's just a matter of taste. Directory routes are cleaner and clearer in my opinion, and most importantly will be simpler to demo in this workshop.

## Creating routes

Docs: https://tanstack.com/router/latest/docs/routing/routing-concepts
and
https://tanstack.com/router/latest/docs/routing/file-based-routing

## Creating routes

Just put them under the right folder, and name it accordingly.

// matches /workouts
routes/workouts/index.tsx

// matches /workouts/6
routes/workouts/$id.tsx

## Layouts

layouts are named `route.tsx`

## Escaping

What if you want a route called `/route` ??

Use `[]` to escape.

```
foo/[route].tsx
```

##

There are MANY advanced routing features that we will not pour over
