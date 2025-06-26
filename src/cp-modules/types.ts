// The type U must be a subtype of type T (entity).
// It must contain an id and can optionally contain other fields of type T.
// It cannot contain properties that are not in type T.
export type EntitySubset<T extends { id: string }, U> = {
  [K in keyof U]: K extends keyof T ? T[K] : never;
} & Pick<T, "id"> &
  Partial<Omit<T, "id">>;
