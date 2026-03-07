# Server Functions

Docs: [https://tanstack.com/start/latest/docs/framework/react/guide/server-functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions)

## Objectives

- Create a server function
- Call it from the server
- Call it from the browser
  - Note the differences (... there are none 😬)

Loaders run on the server (on initial page load), and in the browser thereafter. That will often make them an invalid location to load data, since you won't be able to connect to a database, access sensitive connection strings or api keys, etc.

Server functions are the solution. You can **call** them from anywhere, but they will **always** run on the server.

## Creating a server function

```ts
const getExercisesServerFn = createServerFn({ method: "GET" }).handler(
  async () => {
    return getExercises();
  },
);
```

Or with arguments

```ts
const getWorkoutHistory = createServerFn({ method: "GET" })
  .inputValidator((input: WorkoutHistoryInput) => input)
  .handler(async ({ data }) => {
    const payload = await getWorkouts({
      page: data.page,
    });

    return {
      ...payload,
    };
  });
```

Naturally you don't have to use `GET`

```ts
export const updateWorkout = createServerFn({ method: "POST" })
  .inputValidator((input: WorkoutState) => input)
  .handler(async ({ data }) => {
    await updateWorkoutData(data);
  });
```

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

## This list is incomplete, paltry, even

Check the docs, there's a TON of advanced use cases. Splat routes, pathless layouts, etc. We won't pour over every cool routing trick TanStack Route is capable of, so check the docs!

## Loaders

Loaders load the data for your given page (or layout)

- Add a `loader` async method in your route config
- Request your data (we'll see how to do that soon) in the loader, and return it.
  - Access that data with the Route.useLoaderData() hook
  - Or the `useLoaderData` hook, with the route passed in via `{ from }`

## Demo

Now let's see it in action

I'll briefly add a /blog and /blog/$post route, with static data

## Exercise

Hope fully the demo went well. Your turn:
