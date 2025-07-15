import * as E from 'effect/Effect';

export type Sync<C> = {
  _tag: 'Sync';
  ctx : C;
  run : () => void;
};

export type SyncState<C> = {
  _tag: 'SyncState';
  ctx : any;
  run : () => void;
};
