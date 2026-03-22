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
