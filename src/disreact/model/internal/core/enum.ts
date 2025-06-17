export const isDEV = process.env.NODE_ENV === 'development';

export const TEXT = 1 as const,
             REST = 2 as const,
             COMP = 3 as const;

export const SYNC   = 1 as const,
             ASYNC  = 2 as const,
             EFFECT = 3 as const;

export const SKIP    = 1 as const,
             REPLACE = 2 as const,
             UPDATE  = 3 as const,
             INSERT  = 4 as const,
             REMOVE  = 5 as const,
             RENDER  = 6 as const,
             ADD     = 7 as const;

export const INITIALIZE = 1 as const,
             REHYDRATE  = 2 as const,
             RERENDER   = 3 as const,
             MOUNT      = 4 as const,
             DISMOUNT   = 5 as const,
             EFFECTS    = 6 as const,
             INVOKE     = 7 as const,
             ENCODE     = 8 as const;

export const ASYNC_FUNCTION     = 'AsyncFunction',
             ANONYMOUS_FUNCTION = 'Anonymous';

export const INTERNAL_ERROR = 'Internal Error';
