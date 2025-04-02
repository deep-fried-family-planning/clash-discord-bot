import {CallbackType} from '#src/disreact/codec/rest/callback-type.ts'
import {S} from '#src/disreact/re-exports.ts'
import {RDT} from '#src/internal/pure/effect.ts'
import {DAPIMessage} from 'src/disreact/codec/rest/dapi-message.ts'
import {DAPIModal} from 'src/disreact/codec/rest/dapi-modal.ts'
import type { Doken } from './doken'

export * as Operations from 'src/disreact/codec/operations.ts'
export type Operations = never

export const Discard = S.Struct({
  id   : S.String,
  token: S.Redacted(S.String),
  body : S.Struct({
    type: S.tag(CallbackType.UPDATE),
  }),
})

export const CreateModal = S.Struct({
  id   : S.String,
  token: S.Redacted(S.String),
  body : S.Struct({
    type: S.tag(CallbackType.MODAL),
    data: DAPIModal.Open,
  }),
})

export const CreateSource = S.Struct({
  id   : S.String,
  token: S.Redacted(S.String),
  body : S.Struct({
    type: S.tag(CallbackType.SOURCE),
    data: DAPIMessage.Base,
  }),
})

export const CreateUpdate = S.Struct({
  id   : S.String,
  token: S.Redacted(S.String),
  body : S.Struct({
    type: S.tag(CallbackType.UPDATE),
    data: DAPIMessage.Base,
  }),
})

export const Create = S.Union(
  CreateModal,
  CreateSource,
  CreateUpdate,
)

export const DeferSource = S.Struct({
  id   : S.String,
  token: S.Redacted(S.String),
  body : S.Struct({
    type: S.tag(CallbackType.SOURCE_DEFER),
    data: S.optional(
      S.Struct({
        flags: S.Literal(64),
      }),
    ),
  }),
})

export const DeferUpdate = S.Struct({
  id   : S.String,
  token: S.Redacted(S.String),
  body : S.Struct({
    type: S.tag(CallbackType.UPDATE_DEFER),
    data: S.optional(
      S.Struct({
        flags: S.Literal(64),
      }),
    ),
  }),
})

export const Defer = S.Union(
  DeferSource,
  DeferUpdate,
)

export const Reply = S.Struct({
  app  : S.String,
  token: S.Redacted(S.String),
  body : DAPIMessage.Base,
})

export const Dismount = S.Struct({
  app  : S.String,
  token: S.Redacted(S.String),
})

export type Discard = typeof Discard.Encoded
export type Create = typeof Create.Encoded
export type Defer = typeof Defer.Encoded
export type Reply = typeof Reply.Encoded
export type Dismount = typeof Dismount.Encoded

export const makeDiscardFromFresh = (doken: Doken.Fresh): Discard =>
  ({
    id   : doken.id,
    token: RDT.value(doken.val),
    body : {
      type: CallbackType.UPDATE,
    },
  })

export const makeDismountFrom
