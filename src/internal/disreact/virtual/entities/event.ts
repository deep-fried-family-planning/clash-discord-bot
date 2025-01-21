import {D} from '#pure/effect';
import type {Cm, Co, Cv, DA} from '#src/internal/disreact/virtual/entities/index.ts';
import type {num, obj, str} from '#src/internal/pure/types-pure.ts';


export type T = D.TaggedEnum<{
  None     : obj;
  Relay    : {container: Co.T; id: str};
  Restore  : {container: Co.T};
  Hydrate  : obj;
  Update   : obj;
  Rehydrate: obj;
  Open     : obj;
  Submit   : obj;
  Click    : {row: num; col: num; resolved: DA.IxResolved; target: Cm.T['data']; values: Cv.T[]};
}>;

export type None = D.TaggedEnum.Value<T, 'None'>;
export type Relay = D.TaggedEnum.Value<T, 'Relay'>;
export type Restore = D.TaggedEnum.Value<T, 'Restore'>;
export type Hydrate = D.TaggedEnum.Value<T, 'Hydrate'>;
export type Rehydrate = D.TaggedEnum.Value<T, 'Rehydrate'>;
export type Update = D.TaggedEnum.Value<T, 'Update'>;
export type Open = D.TaggedEnum.Value<T, 'Open'>;
export type Submit = D.TaggedEnum.Value<T, 'Submit'>;
export type Click = D.TaggedEnum.Value<T, 'Click'>;

const T = D.taggedEnum<T>();

export const None = T.None;
export const Relay = T.Relay;
export const Restore = T.Restore;
export const Hydrate = T.Hydrate;
export const Rehydrate = T.Rehydrate;
export const Update = T.Update;
export const Open = T.Open;
export const Submit = T.Submit;
export const Click = T.Click;

export const isNone = T.$is('None');
export const isRelay = T.$is('Relay');
export const isRestore = T.$is('Restore');
export const isHydrate = T.$is('Hydrate');
export const isRehydrate = T.$is('Rehydrate');
export const isUpdate = T.$is('Update');
export const isOpen = T.$is('Open');
export const isSubmit = T.$is('Submit');
export const isClick = T.$is('Click');
