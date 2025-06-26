export const IS_DEV         = (process.env.NODE_ENV === 'development') as true,
             INTERNAL_ERROR = 'Internal Error' as const;

export const noop = () => {};

export const isDev = (): true => (process.env.NODE_ENV === 'development') as true;

export const JSX  = 0,
             JSXS = 1;

export const TEXT_NODE  = 0 as const,
             FRAGMENT   = 1 as const,
             INTRINSIC  = 2 as const,
             FUNCTIONAL = 3 as const;

export const SYNC   = 1 as const,
             ASYNC  = 2 as const,
             EFFECT = 3 as const;

export const ANONYMOUS = 'Anonymous' as const;

export const PROPS   = 0 as const,
             STRUCT  = 1 as const,
             ARRAY   = 2 as const,
             HANDLER = 3 as const;

export const PHASE_NONE      = 0 as const,
             PHASE_HYDRATE   = 1 as const,
             PHASE_INIT      = 2 as const,
             PHASE_UPDATE    = 3 as const,
             PHASE_INVOKE    = 4 as const,
             PHASE_RERENDER  = 5 as const,
             PHASE_MOUNT     = 6 as const,
             PHASE_UNMOUNT   = 7 as const,
             PHASE_DEHYDRATE = 8 as const;

export const MONOMER_NONE    = 0 as const,
             MONOMER_STATE   = 1 as const,
             MONOMER_EFFECT  = 2 as const,
             MONOMER_REF     = 3 as const,
             MONOMER_MEMO    = 4 as const,
             MONOMER_CONTEXT = 5 as const;
