# Routing Basics

Docs: [https://tanstack.com/router/latest/docs/routing/file-based-routing#directory-routes](https://tanstack.com/router/latest/docs/routing/file-based-routing#directory-routes)

## Objectives

- Create a route
- Create a route with a path param (ie /blog/posts/:slug)
- Look at search params

TanStack supports directory routes, or flat routes.

## Flat (file) routes

Instead of (with directories)

app/workouts/edit/$id.tsx

You do

app.workouts.edit.$id.tsx

## Directory routing

Just put them under the right folder, and name accordingly.

// For the /workouts route

```
routes/workouts/index.tsx
```

// For the /workouts/6

```
routes/workouts/$id.tsx
```

## We'll be using

... directory routes. Hope you agree!

Directory routes are cleaner and clearer in my opinion, and most importantly will be simpler to demo in this workshop.

## Your first route

```ts
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/lessons/1/workouts/foo')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/lessons/1/workouts/foo"!</div>
}
```

Seems like a lot of boilerplate, but stay tuned (and the boilerplate serves a purpose).

## Route structure

- Use $xyz for path params
- Use route.tsx for a layout
- Escape route names with `[]`
  - So [route].tsx if you literally want a /route route

## Search params

You have to declare them!

```ts
validateSearch: (searchParams: Record<string, string>) => {
  return {
    // take what you need
  };
},
```

## This list is incomplete, paltry, even

Check the docs, there's a TON of advanced use cases. Splat routes, pathless layouts, etc. We won't pour over every cool routing trick TanStack Route is capable of, so check the docs!

Docs are here: https://tanstack.com/router/latest/docs/routing/file-based-routing

I wrote a three-part blog post on Router - part 1 covers many more routing intricacies:
https://frontendmasters.com/blog/introducing-tanstack-router/
