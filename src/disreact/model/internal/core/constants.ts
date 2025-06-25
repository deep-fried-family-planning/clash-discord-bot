export const IS_DEV = (process.env.NODE_ENV === 'development') as true,
             INTERNAL_ERROR = 'Internal Error' as const;

export const TEXT_NODE  = 0 as const,
             FRAGMENT   = 1 as const,
             INTRINSIC  = 2 as const,
             FUNCTIONAL = 3 as const;

export const SYNC   = 1 as const,
             ASYNC  = 2 as const,
             EFFECT = 3 as const;

export const ANONYMOUS = 'Anonymous' as const;

export const JSX = 0,
             JSXS = 1;
