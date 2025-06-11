export type Const = never;

export const isDev = process.env.NODE_ENV === 'development';

export const ElementId = Symbol.for('ElementId');

export const TEXT = 1 as const,
             REST = 2 as const,
             COMP = 3 as const;

export type ElementType = | typeof TEXT
                          | typeof REST
                          | typeof COMP;

export const SYNC    = 1 as const,
             PROMISE = 2 as const,
             EFFECT  = 3 as const;

export type FunctionType = | typeof SYNC
                           | typeof PROMISE
                           | typeof EFFECT;

export const SKIP    = 1 as const,
             REPLACE = 2 as const,
             UPDATE  = 3 as const,
             INSERT  = 4 as const,
             REMOVE  = 5 as const,
             RENDER  = 6 as const;

export type DiffType = | typeof SKIP
                       | typeof REPLACE
                       | typeof UPDATE
                       | typeof INSERT
                       | typeof REMOVE
                       | typeof RENDER;

export const INITIALIZE = 1 as const,
             REHYDRATE  = 2 as const,
             RERENDER   = 3 as const,
             MOUNT      = 4 as const,
             DISMOUNT   = 5 as const,
             EFFECTS    = 6 as const,
             INVOKE    = 7 as const,
             ENCODE     = 8 as const;

export type LifecycleType = | typeof INITIALIZE
                            | typeof REHYDRATE
                            | typeof RERENDER
                            | typeof MOUNT
                            | typeof DISMOUNT
                            | typeof EFFECTS
                            | typeof INVOKE
                            | typeof ENCODE;

export const ASYNC_FUNCTION = 'AsyncFunction';
export const ANONYMOUS_FUNCTION = 'Anonymous';
