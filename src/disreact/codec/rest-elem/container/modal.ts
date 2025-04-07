import {TextInput} from '#src/disreact/codec/rest-elem/component/textinput.ts'
import {Keys} from '#src/disreact/codec/rest-elem/keys.ts'
import {Util} from '#src/disreact/codec/rest-elem/util.ts'
import * as S from 'effect/Schema'
import {DAPIModal} from '#src/disreact/codec/dapi/dapi-modal'

export * as Modal from '#src/disreact/codec/rest-elem/container/modal.ts'
export type Modal = never

export const TAG  = 'modal',
             NORM = TAG

export const Event = Util.declareEvent(
  TAG,
  S.Struct({}),
  DAPIModal.Data,
)

export const Handler = Util.declareHandler(Event)

export const Children = S.Union(
  TextInput.Element,
)

export const Attributes = Util.declareProps(
  S.Struct({
    custom_id      : S.optional(S.String),
    title          : S.String,
    open           : S.optional(S.Boolean),
    [Keys.onsubmit]: Handler,
  }),
)

export const Element = Util.declareHandlerElem(
  TAG,
  Attributes,
  Event,
)

export const encode = (self: any, acc: any) => {
  return {
    custom_id : self.props.custom_id ?? self.ids,
    title     : self.props.title,
    components: acc[Keys.components],
    open      : self.props.open,
  }
}
