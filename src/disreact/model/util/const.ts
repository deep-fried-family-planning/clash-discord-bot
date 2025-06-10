export type Const = never;

export const TEXT = 1,
             REST = 2,
             COMP = 3;

export type ElementType = | typeof TEXT
                          | typeof REST
                          | typeof COMP;

export const SYNC    = 1,
             PROMISE = 2,
             EFFECT  = 3;

export type FunctionType = | typeof SYNC
                           | typeof PROMISE
                           | typeof EFFECT;

export const SKIP    = 1,
             REPLACE = 2,
             UPDATE  = 3,
             INSERT  = 4,
             REMOVE  = 5,
             RENDER  = 6;

export type DiffType = | typeof SKIP
                       | typeof REPLACE
                       | typeof UPDATE
                       | typeof INSERT
                       | typeof REMOVE
                       | typeof RENDER;

export const INITIALIZE = 1,
             REHYDRATE  = 2,
             RERENDER   = 3,
             MOUNT      = 4,
             DISMOUNT   = 5,
             EFFECTS    = 6,
             ENCODE     = 7;

export type LifecycleType = | typeof INITIALIZE
                            | typeof REHYDRATE
                            | typeof RERENDER
                            | typeof MOUNT
                            | typeof DISMOUNT
                            | typeof EFFECTS
                            | typeof ENCODE;

export const ASYNC_FUNCTION = 'AsyncFunction';
