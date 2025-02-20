import {BitField, CustomId, InteractionToken, Locale, SnowFlake} from '#src/disreact/codec/schema/common-schema.ts';
import {DTML} from '#src/disreact/dsx/index.ts';
import {pipe, S} from '#src/internal/pure/effect.ts';
import {Record} from 'effect';



export const TextOut = S.Struct({
  custom_id : CustomId,
  type      : S.Int,
  style     : S.Int,
  label     : S.String.pipe(S.maxLength(45)),
  value     : S.String.pipe(S.maxLength(4000), S.optional),
  min_length: S.Int.pipe(S.optional),
  max_length: S.Int.pipe(S.optional),
  required  : S.Boolean.pipe(S.optional),
});
export type TextOut = S.Schema.Type<typeof TextOut>;


export const DialogData = S.TaggedStruct('DIALOG_IN', {
  custom_id : CustomId,
  components: pipe(
    S.Struct({
      type      : S.Int,
      components: pipe(
        TextOut,
        S.Array,
        S.itemsCount(1),
      )},
    ),
    S.Array,
    S.maxItems(5),
  ),
});


export const ButtonData = S.TaggedStruct('ButtonData', {
  custom_id     : CustomId,
  component_type: S.Int,
});


export const SelectData = S.TaggedStruct('SelectData', {
  custom_id     : CustomId,
  component_type: S.Int,
  values        : S.Array(S.String).pipe(S.maxItems(25)),
});


export const AutoSelectData = S.TaggedStruct('AutoSelectData', {
  custom_id     : CustomId,
  component_type: S.Int,
  values        : S.Array(S.String),
  resolved      : S.Struct({
    // todo
  }),
});



export const InteractionBody = S.Struct({
  version        : S.Literal(1),
  application_id : SnowFlake,
  app_permissions: BitField,
  id             : SnowFlake,
  token          : InteractionToken,
  type           : S.Number,
  context        : S.Number,

  data: S.Union(
    DialogData,
    ButtonData,
    SelectData,
    AutoSelectData,
  ),

  channel_id: SnowFlake,
  channel   : S.optional(S.Struct({

  })),

  guild_id    : SnowFlake,
  guild_locale: Locale,
  guild       : S.Struct({

  }),

  locale: Locale,
  member: S.Struct({}),
});



export type InteractionBody = S.Schema.Type<typeof InteractionBody>;


export const EmbedAttributes = S.Struct({});


export const EmbedOut = S.Struct({
  title      : S.String.pipe(S.maxLength(256)),
  description: S.String.pipe(S.maxLength(4096), S.optional),
  url        : S.String.pipe(S.maxLength(2000), S.optional),
  timestamp  : S.String.pipe(S.optional),
  color      : S.Int.pipe(S.optional),
  footer     : S.Struct({
    text: S.String.pipe(S.maxLength(2048)),
  }),
  image: S.Struct({}),
});


export const MessageOut = S.Struct({
  flags  : S.Int,
  content: S.String.pipe(S.maxLength(2000), S.optional),
  embeds : pipe(
    S.Struct({

    }),
  ),
});



export const DialogOut = S.Struct({
  title: S.String.pipe(S.maxLength(45)),
  ...DialogData.fields,
});
export type DialogOut = S.Schema.Type<typeof DialogOut>;
