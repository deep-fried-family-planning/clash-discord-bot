import {S} from '#src/disreact/utils/re-exports.ts';
import { DAPIComponent } from './dapi-component.ts';

export * as DAPIModal from 'src/disreact/codec/dapi/modal.ts';
export type Modal = never;

export const Open = S.Struct({
  custom_id : S.String,
  title     : S.String,
  components: S.Array(
    DAPIComponent.ActionRow(DAPIComponent.TextInput),
  ),
});

export const Data = S.Struct({
  custom_id : S.String,
  components: S.Array(
    DAPIComponent.ActionRow(DAPIComponent.TextInput.pick('type', 'custom_id', 'value')),
  ),
});

export const Any = S.Struct({
  custom_id : S.String,
  title     : S.optional(S.Any),
  components: S.Any,
});
