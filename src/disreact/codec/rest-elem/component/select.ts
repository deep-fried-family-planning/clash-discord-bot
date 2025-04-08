import {Option} from '#src/disreact/codec/rest-elem/component/option.ts'
import {Keys} from '#src/disreact/codec/rest-elem/keys.ts'
import {declareHandlerElem, declareProps} from '#src/disreact/codec/rest-elem/util.ts'
import type {Elem} from '#src/disreact/model/entity/elem.ts'
import {Events} from '#src/disreact/model/entity/events'
import {S} from '#src/disreact/utils/re-exports.ts'
import {DAPI} from '../../dapi/dapi'

export * as Select from '#src/disreact/codec/rest-elem/component/select.ts'
export type Select = never

export const TAG  = 'select',
             NORM = Keys.components

export const EventData = S.Struct({
  data  : DAPI.Component.StringSelectData,
  values: S.Array(S.String),
})

export const Handler = Events.declareHandler(EventData)

export const Children = S.Union(
  Option.Element,
)

export const Attributes = declareProps(
  S.Struct({
    custom_id      : S.optional(S.String),
    placeholder    : S.optional(S.String),
    max_values     : S.optional(S.Number),
    min_values     : S.optional(S.Number),
    options        : S.optional(S.Array(Option.Attributes)),
    disabled       : S.optional(S.Boolean),
    [Keys.onselect]: Handler,
  }),
)

export const Element = declareHandlerElem(
  TAG,
  Attributes,
  Handler,
)

export const encode = (self: Elem, acc: any) => {
  return {
    type      : DAPI.Component.ACTION_ROW,
    components: [{
      custom_id  : self.props.custom_id ?? self.ids,
      type       : DAPI.Component.SELECT_MENU,
      placeholder: self.props.label ?? acc[Keys.primitive]?.[0],
      min_values : self.props.min_values,
      max_values : self.props.max_values,
      options    : self.props.options ?? acc[Keys.options],
      disabled   : self.props.disabled,
    }],
  }
}
