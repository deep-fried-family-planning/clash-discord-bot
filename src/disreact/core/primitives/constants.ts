export const
  IS_DEV         = (process.env.NODE_ENV === 'development') as true,
  INTERNAL_ERROR = 'Internal Error' as const;

// DX to help auto import in IDE at dev time
export type DEV_STUB = never;
export declare const DEV_STUB: never;

export const noop = () => {};

export const isDev = (): true => (process.env.NODE_ENV === 'development') as true;

export const
  JSX  = 0,
  JSXS = 1;

export const
  TEXT_NODE  = 0 as const,
  LIST_NODE  = 1 as const,
  FRAGMENT   = 2 as const,
  INTRINSIC  = 3 as const,
  FUNCTIONAL = 4 as const;

export type NodeTag =
  | typeof TEXT_NODE
  | typeof LIST_NODE
  | typeof FRAGMENT
  | typeof INTRINSIC
  | typeof FUNCTIONAL;

export const
  SYNC   = 1 as const,
  ASYNC  = 2 as const,
  EFFECT = 3 as const;

export type FCExecution =
  | typeof SYNC
  | typeof ASYNC
  | typeof EFFECT;

export const ANONYMOUS = 'Anonymous' as const;

export const
  PROPS   = 0 as const,
  STRUCT  = 1 as const,
  ARRAY   = 2 as const,
  HANDLER = 3 as const;

export const
  PHASE_NONE      = 0 as const,
  PHASE_HYDRATE   = 1 as const,
  PHASE_INIT      = 2 as const,
  PHASE_UPDATE    = 3 as const,
  PHASE_INVOKE    = 4 as const,
  PHASE_RERENDER  = 5 as const,
  PHASE_MOUNT     = 6 as const,
  PHASE_UNMOUNT   = 7 as const,
  PHASE_DEHYDRATE = 8 as const;

export type LifecyclePhase =
  | typeof PHASE_NONE
  | typeof PHASE_HYDRATE
  | typeof PHASE_INIT
  | typeof PHASE_UPDATE
  | typeof PHASE_INVOKE
  | typeof PHASE_RERENDER
  | typeof PHASE_MOUNT
  | typeof PHASE_UNMOUNT
  | typeof PHASE_DEHYDRATE;

export const
  POLYMER_STRATEGY_INITIALIZE = 1 as const,
  POLYMER_STRATEGY_REHYDRATE  = 2 as const,
  POLYMER_STRATEGY_STATELESS  = 3 as const;

export type PolymerStrategy =
  | typeof POLYMER_STRATEGY_INITIALIZE
  | typeof POLYMER_STRATEGY_REHYDRATE
  | typeof POLYMER_STRATEGY_STATELESS;

export const
  POLYMER_STATE_MAKE   = 1 as const,
  POLYMER_STATE_IDLE   = 2 as const,
  POLYMER_STATE_READY  = 3 as const,
  POLYMER_STATE_RUN    = 4 as const,
  POLYMER_STATE_COMMIT = 5 as const;

export type PolymerState =
  | typeof POLYMER_STATE_MAKE
  | typeof POLYMER_STATE_IDLE
  | typeof POLYMER_STATE_READY
  | typeof POLYMER_STATE_RUN
  | typeof POLYMER_STATE_COMMIT;

export const
  MONOMER_NONE    = 0 as const,
  MONOMER_STATE   = 1 as const,
  MONOMER_REDUCER   = 2 as const,
  MONOMER_EFFECT  = 3 as const,
  MONOMER_REF     = 4 as const,
  MONOMER_MEMO    = 5 as const,
  MONOMER_CONTEXT = 6 as const;

export type MonomerTag =
  | typeof MONOMER_NONE
  | typeof MONOMER_STATE
  | typeof MONOMER_REDUCER
  | typeof MONOMER_EFFECT
  | typeof MONOMER_REF
  | typeof MONOMER_MEMO
  | typeof MONOMER_CONTEXT;

export const
  DOCUMENT_SYNTHESIZE = 1 as const,
  DOCUMENT_REHYDRATE  = 2 as const;

export type DocumentType =
  | typeof DOCUMENT_SYNTHESIZE
  | typeof DOCUMENT_REHYDRATE;
