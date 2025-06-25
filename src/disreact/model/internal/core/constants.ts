export const IS_DEV         = (process.env.NODE_ENV === 'development') as true,
             INTERNAL_ERROR = 'Internal Error' as const;

export const TEXT_NODE  = 0 as const,
             FRAGMENT   = 1 as const,
             INTRINSIC  = 2 as const,
             FUNCTIONAL = 3 as const;

export const SYNC   = 1 as const,
             ASYNC  = 2 as const,
             EFFECT = 3 as const;

export const ANONYMOUS = 'Anonymous' as const;

export const JSX  = 0,
             JSXS = 1;

export const PROPS  = 0,
             STRUCT = 1,
             ARRAY  = 2,
             HANDLER = 3;

export const PHASE_NONE      = 0,
             PHASE_HYDRATE   = 1,
             PHASE_INIT      = 2,
             PHASE_UPDATE    = 3,
             PHASE_INVOKE    = 4,
             PHASE_RERENDER  = 5,
             PHASE_MOUNT     = 6,
             PHASE_UNMOUNT   = 7,
             PHASE_DEHYDRATE = 8;
