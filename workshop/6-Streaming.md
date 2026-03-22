# Streaming

## Objectives

- Stream data

## The one tradeoff with ssr

```ts
// admin/route.tsx
export const Route = createFileRoute("/app/admin")({
  component: RouteComponent,
});
```

This is a layout, but it looks just like any other, "normal" route, because it is.

It takes the same loader argument, if you want. Data fetched in a layout are merged, and available (and statically typed!) in any pages underneath the layout.

## Demo

Now let's see it in action

I'll briefly add a layout atop the /blog and /blog/$post routes from before, load some user data for it, and then integrate into both routes

## Exercise

Hope fully the demo went well. Your turn:
