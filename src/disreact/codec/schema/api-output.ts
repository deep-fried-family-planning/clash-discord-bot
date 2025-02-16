import {Arr, Bool, CustomId, SnowFlake, Str, tempAny} from '#src/disreact/codec/schema/shared.ts';
import {Int, Literal, maxItems, maxLength, minItems, optional, Struct, transform, Union} from 'effect/Schema';
import * as Element from '#src/disreact/codec/schema/dom-intrinsic.ts';



export const EmbedOut = Struct({
  title      : optional(Str.pipe(maxLength(256))),
  description: optional(Str.pipe(maxLength(4096))),
  url        : optional(Str.pipe(maxLength(2000))),
  timestamp  : optional(Str),
  color      : optional(Int),
  footer     : optional(Struct({
    text: Str.pipe(maxLength(2048)),
  })),
  image: optional(Struct({
    url: optional(Str),
  })),
});



export const EmojiOut = Struct({

});
export const EmojiTransformDFMD = transform(

);
export const EmojiTransformDTML = transform(

);



export const PrimaryButtonOut = Struct({
  custom_id: CustomId,
  type     : Literal(2),
  style    : Literal(1),
  label    : optional(Str.pipe(maxLength(45))),
  emoji    : optional(EmojiOut),
  disabled : optional(Bool),
});
export const PrimaryButtonTransformDTML = transform(
  PrimaryButtonOut,
  Element.PrimaryButtonElementAttributes, {
    encode: (attributes) => tempAny(),
    decode: (attributes) => tempAny(),
  },
);


export const SecondaryButtonOut = Struct({
  custom_id: CustomId,
  type     : Literal(2),
  style    : Literal(2),
  label    : optional(Str.pipe(maxLength(45))),
  emoji    : optional(EmojiOut),
});



export const SuccessButtonOut = Struct({
  custom_id: CustomId,
  type     : Literal(2),
  style    : Literal(3),
  label    : optional(Str.pipe(maxLength(45))),
  emoji    : optional(EmojiOut),
});



export const DangerButtonOut = Struct({
  custom_id: CustomId,
  type     : Literal(2),
  style    : Literal(4),
  label    : optional(Str.pipe(maxLength(45))),
  emoji    : optional(EmojiOut),
});



export const LinkButtonOut = Struct({
  custom_id: CustomId,
  type     : Literal(2),
  style    : Literal(5),
  label    : optional(Str.pipe(maxLength(45))),
  emoji    : optional(EmojiOut),
  url      : Str,
  disabled : optional(Bool),
});



export const PremiumButtonOut = Struct({
  sku_id: Str,
  type  : Literal(2),
  style : Literal(6),
});



export const ButtonOut = Union(
  PrimaryButtonOut,
  SecondaryButtonOut,
  SuccessButtonOut,
  DangerButtonOut,
  LinkButtonOut,
  PremiumButtonOut,
);


export const ButtonActionRowOut = Struct({
  type      : Literal(1),
  components: Arr(ButtonOut).pipe(minItems(1), maxItems(5)),
});



export const StringSelectOptionOut = Struct({
  label      : Str.pipe(maxLength(100)),
  value      : Str.pipe(maxLength(100)),
  description: optional(Str.pipe(maxLength(150))),
  emoji      : optional(EmojiOut),
  default    : optional(Bool),
});



export const StringSelectOut = Struct({
  custom_id  : CustomId,
  type       : Literal(3),
  options    : Arr(StringSelectOptionOut).pipe(minItems(1), maxItems(25)),
  placeholder: optional(Str.pipe(maxLength(150))),
  min_values : optional(Int),
  max_values : optional(Int),
  disabled   : optional(Bool),
});



export const UserDefaultValue = Struct({
  id  : SnowFlake,
  type: Literal('user'),
});



export const UserSelectOut = Struct({
  custom_id     : CustomId,
  type          : Literal(5),
  min_values    : optional(Int),
  max_values    : optional(Int),
  disabled      : optional(Bool),
  default_values: optional(Arr(UserDefaultValue)),
});



export const ChannelDefaultValue = Struct({
  id  : SnowFlake,
  type: Literal('channel'),
});



export const ChannelSelectOut = Struct({
  custom_id     : CustomId,
  type          : Literal(8),
  min_values    : optional(Int),
  max_values    : optional(Int),
  disabled      : optional(Bool),
  default_values: optional(Arr(ChannelDefaultValue)),
  channel_types : optional(Arr(Int)),
});



export const RoleDefaultValue = Struct({
  id  : SnowFlake,
  type: Literal('role'),
});



export const RoleSelectOut = Struct({
  custom_id     : CustomId,
  type          : Literal(6),
  min_values    : optional(Int),
  max_values    : optional(Int),
  disabled      : optional(Bool),
  default_values: optional(Arr(RoleDefaultValue)),
});



export const MentionDefaultValue = Union(
  UserDefaultValue,
  ChannelDefaultValue,
  RoleDefaultValue,
);



export const MentionableSelectOut = Struct({
  custom_id     : CustomId,
  type          : Literal(7),
  min_values    : optional(Int),
  max_values    : optional(Int),
  disabled      : optional(Bool),
  default_values: optional(Arr(MentionDefaultValue)),
});



export const AutoSelectOut = Union(
  UserSelectOut,
  ChannelSelectOut,
  RoleSelectOut,
  MentionableSelectOut,
);



export const SelectorOut = Union(
  StringSelectOut,
  UserSelectOut,
  ChannelSelectOut,
  RoleSelectOut,
  MentionableSelectOut,
);


export const SelectorActionRowOut = Struct({
  type      : Literal(1),
  components: Arr(SelectorOut).pipe(minItems(1), maxItems(1)),
});


export const MessageActionRowOut = Union(ButtonActionRowOut, SelectorActionRowOut);


export const MessageOut = Struct({
  flags     : optional(Int),
  content   : optional(Str.pipe(maxLength(2000))),
  embeds    : optional(Arr(EmbedOut)),
  components: optional(Arr(MessageActionRowOut).pipe(maxItems(5))),
});


export const TextOut = Struct({
  custom_id : CustomId,
  type      : Literal(4),
  style     : Literal(1, 2),
  label     : Str.pipe(maxLength(45)),
  value     : optional(Str.pipe(maxLength(4000))),
  min_length: optional(Int),
  max_length: optional(Int),
  required  : optional(Boolean),
});


export const DialogActionRowOut = Struct({
  type      : Literal(1),
  components: Arr(TextOut).pipe(maxItems(5)),
});


export const DialogOut = Struct({
  custom_id : CustomId,
  title     : Str.pipe(maxLength(45)),
  components: Arr(DialogActionRowOut),
});


export const InteractionOutput = Union(MessageOut, DialogOut);
