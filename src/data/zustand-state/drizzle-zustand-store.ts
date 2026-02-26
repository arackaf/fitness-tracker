import { create, type StoreApi, type UseBoundStore } from "zustand";

type AnyPgTable = { $inferInsert: object };

type DrizzleTableType<T extends AnyPgTable> = T extends {
  $inferInsert: infer U;
}
  ? U
  : never;

type UpdatableObject<T> = T & {
  performUpdate: (payload: Partial<T>) => void;
};

export type DrizzleZustandStore<T extends AnyPgTable> = UseBoundStore<
  StoreApi<UpdatableObject<DrizzleTableType<T>>>
>;

export const createDrizzleObjectStore = <T extends AnyPgTable>(
  table: T,
): DrizzleZustandStore<T> => {
  return create<UpdatableObject<DrizzleTableType<T>>>(set => {
    return {
      ...(table.$inferInsert as DrizzleTableType<T>),
      performUpdate: payload => {
        set(state => {
          return { ...state, ...payload };
        });
      },
    };
  });
};
