export const ASYNC_CONSTRUCTOR = (async () => {}).constructor;

export const
  SYNC    = 'Sync',
  ASYNC   = 'Async',
  EFFECT  = 'Effect',
  UNKNOWN = 'Unknown';

export type FCKind =
  | typeof SYNC
  | typeof ASYNC
  | typeof EFFECT
  | typeof UNKNOWN;

export const
  TEXT      = 'Text',
  FRAGMENT  = 'Fragment',
  INTRINSIC = 'Intrinsic',
  COMPONENT = 'Component';

export type ElementKind =
  | typeof TEXT
  | typeof FRAGMENT
  | typeof INTRINSIC
  | typeof COMPONENT;

export const
  NONE       = 1,
  STATE      = 2,
  REF        = 3,
  MEMO       = 4,
  CONTEXTUAL = 5;

export type MonoKind =
  | typeof NONE
  | typeof STATE
  | typeof REF
  | typeof MEMO
  | typeof CONTEXTUAL;
