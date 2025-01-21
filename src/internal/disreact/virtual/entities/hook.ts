import {D} from '#pure/effect';
import type {num, unk} from '#src/internal/pure/types-pure.ts';
import type {AnyE} from '#src/internal/types.ts';


export type T = D.TaggedEnum<{
  Sync       : {sync_id: num; data: unk};
  Update     : {sync_id: num; data: unk};
  UpdateAsync: {sync_id: num; data: () => AnyE<unk>};
}>;

export type Sync = D.TaggedEnum.Value<T, 'Sync'>;
export type Update = D.TaggedEnum.Value<T, 'Update'>;
export type UpdateAsync = D.TaggedEnum.Value<T, 'UpdateAsync'>;

export const T = D.taggedEnum<T>();

export const Sync   = T.Sync;
export const Update = T.Update;
export const UpdateAsync = T.UpdateAsync;


export type Call = Update | UpdateAsync;


export type Spec = {
  createSync: () => void;
};
