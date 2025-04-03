import {S} from '#src/disreact/codec/re-exports.ts'
import {DAPIComponent} from './dapi-component.ts'
import {DAPIEmbed} from './dapi-embed.ts'

export * as DAPIMessage from './dapi-message.ts'
export type DAPIMessage = never

export const Base = S.Struct({
  content: S.optional(S.String),
  flags  : S.optional(S.Int),

  embeds: S.optional(
    S.Array(
      DAPIEmbed.Embed,
    ),
  ),

  components: S.optional(
    S.Array(
      S.Union(
        DAPIComponent.ActionRow(DAPIComponent.Button),
        DAPIComponent.ActionRow(DAPIComponent.SelectMenu),
      ),
    ),
  ),
})
