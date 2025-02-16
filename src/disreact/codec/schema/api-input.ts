import {Rest} from '#src/disreact/codec/abstract/index.ts';
import {BitField, CustomId, InteractionToken, Locale, SnowFlake} from '#src/disreact/codec/schema/shared.ts';
import {pipe, S} from '#src/internal/pure/effect.ts';



export const TextData = S.Struct({
  custom_id: CustomId,
  value    : S.String,
});
export type TextData = S.Schema.Type<typeof TextData>;



export const DialogDataTag = 'DialogData';
export const DialogData = S.TaggedStruct(
  DialogDataTag,
  {
    custom_id : CustomId,
    components: pipe(
      S.Struct({
          type      : S.Int,
          components: pipe(
            TextData,
            S.Array,
            S.itemsCount(1),
          ),
        },
      ),
      S.Array,
      S.maxItems(5),
    ),
  },
);
export type DialogData = S.Schema.Type<typeof DialogData>;



export const ButtonDataTag = 'ButtonData';
export const ButtonData = S.TaggedStruct(
  ButtonDataTag,
  {
    custom_id     : CustomId,
    component_type: S.Int,
  },
);
export type ButtonData = S.Schema.Type<typeof ButtonData>;



export const SelectDataTag = 'SelectData';
export const SelectData = S.TaggedStruct(
  SelectDataTag,
  {
    custom_id     : CustomId,
    component_type: S.Int,
    values        : S.Array(S.String).pipe(S.maxItems(25)),
  },
);
export type SelectData = S.Schema.Type<typeof SelectData>;


export const AutoSelectDataTag = 'AutoSelectData';
export const AutoSelectData = S.TaggedStruct(
  AutoSelectDataTag,
  {
    custom_id     : CustomId,
    component_type: S.Int,
    values        : S.Array(S.String),
    resolved      : S.Struct({
      // todo
    }),
  },
);
export type AutoSelectData = S.Schema.Type<typeof AutoSelectData>;



export const Interaction = S.Struct({
  version        : S.Literal(1),
  application_id : SnowFlake,
  app_permissions: BitField,
  id             : SnowFlake,
  token          : InteractionToken,
  type           : S.Number,
  context        : S.Number,
  data           : S.Union(DialogData, ButtonData, SelectData, AutoSelectData),
  channel_id     : SnowFlake,
  channel        : S.optional(S.Struct({})),
  guild_id       : SnowFlake,
  guild_locale   : Locale,
  guild          : S.Struct({}),
  locale         : Locale,
  member         : S.Struct({}),
});
export type Interaction = S.Schema.Type<typeof Interaction>;
