export type None =
    | undefined
    | null;

export type Maybe<T> =
    | T
    | None;

export type Just<T> = Exclude<T, None>;


