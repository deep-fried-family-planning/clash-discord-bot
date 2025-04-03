import {Keys} from '#src/disreact/codec/rest-elem/keys.ts'
import {declareElem, declareProps} from '#src/disreact/codec/rest-elem/util.ts'
import {S} from '#src/disreact/codec/re-exports.ts'
import type {Elem} from '#src/disreact/model/entity/elem.ts'
import {DAPIComponent} from '../../rest/dapi-component'

export * as Premium from '#src/disreact/codec/rest-elem/component/premium.ts'
export type Premium = never

export const TAG  = 'premium',
             NORM = Keys.buttons

export const Children = S.Union(
  S.Undefined,
)

export const Attributes = declareProps(
  S.Struct({
    sku_id: S.String,
  }),
)

export const Element = declareElem(
  TAG,
  Attributes,
)

export const encode = (self: Elem, acc: any) => {
  return {
    type    : DAPIComponent.BUTTON,
    sku_id  : self.props.sku_id,
    style   : DAPIComponent.PREMIUM,
    disabled: self.props.disabled,
  }
}
