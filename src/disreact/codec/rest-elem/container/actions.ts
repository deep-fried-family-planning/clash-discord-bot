import {Button} from '#src/disreact/codec/rest-elem/component/button.ts'
import {Danger} from '#src/disreact/codec/rest-elem/component/danger.ts'
import {Link} from '#src/disreact/codec/rest-elem/component/link.ts'
import {Premium} from '#src/disreact/codec/rest-elem/component/premium.ts'
import {Primary} from '#src/disreact/codec/rest-elem/component/primary.ts'
import {Secondary} from '#src/disreact/codec/rest-elem/component/secondary.ts'
import {Success} from '#src/disreact/codec/rest-elem/component/success.ts'
import {Keys} from '#src/disreact/codec/rest-elem/keys.ts'
import {S} from '#src/disreact/codec/re-exports.ts'
import type {Elem} from '#src/disreact/model/entity/elem.ts'
import {Util} from '../util'

export * as Actions from '#src/disreact/codec/rest-elem/container/actions.ts'
export type Actions = never

export const TAG  = 'actions',
             NORM = Keys.components

export const Children = S.Union(
  Button.Element,
  Primary.Element,
  Secondary.Element,
  Success.Element,
  Danger.Element,
  Link.Element,
  Premium.Element,
)

export const Attributes = Util.declareProps(
  S.Struct({}),
)

export const Element = Util.declareElem(
  TAG,
  Attributes,
)

export const encode = (self: Elem.Rest, acc: any) => {
  return {
    type      : 1,
    components: acc[Keys.buttons],
  }
}
