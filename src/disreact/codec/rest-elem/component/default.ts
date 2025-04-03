import {Keys} from '#src/disreact/codec/rest-elem/keys.ts'
import {declareElem, declareProps} from '#src/disreact/codec/rest-elem/util.ts'
import {S} from '#src/disreact/codec/re-exports.ts'
import type {Elem} from '#src/disreact/model/entity/elem.ts'

export * as Default from '#src/disreact/codec/rest-elem/component/default.ts'
export type Default = never

export const TAG  = 'default',
             NORM = Keys.default_values

export const Children = S.Never

export const Attributes = S.Union(
  declareProps(S.Struct({role: S.String})),
  declareProps(S.Struct({user: S.String})),
  declareProps(S.Struct({channel: S.String})),
)

export const Element = declareElem(
  TAG,
  Attributes,
)

export const encode = (self: Elem, acc: any) => {
  if (self.props.role) {
    return {
      type: 'role',
      id  : self.props.role,
    }
  }

  if (self.props.user) {
    return {
      type: 'user',
      id  : self.props.user,
    }
  }

  return {
    type: 'channel',
    id  : self.props.channel,
  }
}
