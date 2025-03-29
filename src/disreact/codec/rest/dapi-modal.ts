import {S} from '#src/disreact/re-exports.ts'
import { DAPIComponent } from './dapi-component.ts'

export * as DAPIModal from './dapi-modal.ts'
export type DAPIModal = never

export const Open = S.Struct({
  custom_id : S.String,
  title     : S.String,
  components: S.Array(
    DAPIComponent.ActionRow(DAPIComponent.TextInput),
  ),
})

export const Data = S.Struct({
  custom_id : S.String,
  components: S.Array(
    DAPIComponent.ActionRow(DAPIComponent.TextInput.pick('type', 'custom_id', 'value')),
  ),
})
