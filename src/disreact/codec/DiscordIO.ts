import {parseHex} from '#disreact/util/utils.ts';
import {Discord} from 'dfx';
import * as DateTime from 'effect/DateTime';
import type * as Duration from 'effect/Duration';
import * as S from 'effect/Schema';

export const
  Epoch     = 1_420_070_400_000,
  EpochBits = 22n;

export const parseMillis = (snowflake: string | bigint) =>
  Number(BigInt(snowflake) >> EpochBits) + Epoch;

export const parseUtc = (snowflake: string | bigint) =>
  DateTime.unsafeMake(
    parseMillis(snowflake),
  );

export const Snowflake = S.String;

export type Snowflake = bigint | string;

export type SnowflakeJSON = string;

export const TimeToLive = (duration: Duration.Duration) =>
  S.transform(
    Snowflake,
    S.typeSchema(S.DateTimeUtcFromSelf),
    {
      encode: () => '',
      decode: (id) => DateTime.addDuration(parseUtc(id), duration),
    },
  );

export const
  Int32IdInput   = S.optional(S.Number),
  Int32IdOutput  = S.optional(S.Int.pipe(S.between(0, 2147483647))),
  CustomIdInput  = S.String,
  CustomIdOutput = S.String.pipe(S.maxLength(100));

export const
  Str45   = S.String.pipe(S.maxLength(45)),
  Str80   = S.String.pipe(S.maxLength(80)),
  Str100  = S.String.pipe(S.maxLength(100)),
  Str150  = S.String.pipe(S.maxLength(150)),
  Str256  = S.String.pipe(S.maxLength(256)),
  Str512  = S.String.pipe(S.maxLength(512)),
  Str1000 = S.String.pipe(S.maxLength(1000)),
  Str1024 = S.String.pipe(S.maxLength(1024)),
  Str2000 = S.String.pipe(S.maxLength(2000)),
  Str2048 = S.String.pipe(S.maxLength(2048)),
  Str4000 = S.String.pipe(S.maxLength(4000)),
  Str4096 = S.String.pipe(S.maxLength(4096));

export const
  Int0to25    = S.Int.pipe(S.between(0, 25)),
  Int1to25    = S.Int.pipe(S.between(1, 25)),
  Int0to4000  = S.Int.pipe(S.between(0, 4000)),
  Int1to4000  = S.Int.pipe(S.between(1, 4000)),
  IntHexColor = S.Int.pipe(S.between(0, 0xFFFFFF));

export const HexColor = S.transform(
  S.Int,
  S.Union(IntHexColor, S.String),
  {
    decode: (int) => int,
    encode: (hex) => parseHex(hex),
  },
);

export const EmojiInput = S.Struct({
  id      : S.optional(S.String),
  name    : S.optional(S.String),
  animated: S.optional(S.Boolean),
});
export const EmojiOutput = S.Struct({
  id      : S.optional(S.String),
  name    : S.optional(S.String),
  animated: S.optional(S.Boolean),
});

/**
 * @link https://discord.com/developers/docs/components/reference#unfurled-media-item-structure
 */
export const UnfurledMediaItemInput = S.Struct({
  url          : S.String,
  proxy_url    : S.optional(S.String),
  height       : S.optional(S.Number),
  width        : S.optional(S.Number),
  content_type : S.optional(S.String),
  attachment_id: S.optional(S.String),
});

export const UnfurledMediaItemOutput = S.Struct({
  url: S.String,
});

export const ButtonData = S.Struct({
  component_type: S.tag(Discord.MessageComponentTypes.BUTTON),
  custom_id     : CustomIdInput,
});

export const ButtonPrimaryInput = S.Struct({
  id       : Int32IdInput,
  type     : S.tag(Discord.MessageComponentTypes.BUTTON),
  style    : S.tag(Discord.ButtonStyleTypes.PRIMARY),
  custom_id: CustomIdInput,
  emoji    : S.optional(EmojiInput),
  label    : S.optional(S.String),
  disabled : S.optional(S.Boolean),
});
export const ButtonPrimaryOutput = S.Struct({
  id       : Int32IdOutput,
  type     : S.tag(Discord.MessageComponentTypes.BUTTON),
  style    : S.tag(Discord.ButtonStyleTypes.PRIMARY),
  custom_id: CustomIdOutput,
  emoji    : S.optional(EmojiOutput),
  label    : S.optional(Str80),
  disabled : S.optional(S.Boolean),
});

export const ButtonSecondaryInput = S.Struct({
  id       : Int32IdInput,
  type     : S.tag(Discord.MessageComponentTypes.BUTTON),
  style    : S.tag(Discord.ButtonStyleTypes.SECONDARY),
  custom_id: CustomIdInput,
  emoji    : S.optional(EmojiInput),
  label    : S.optional(S.String),
  disabled : S.optional(S.Boolean),
});
export const ButtonSecondaryOutput = S.Struct({
  id       : Int32IdOutput,
  type     : S.tag(Discord.MessageComponentTypes.BUTTON),
  style    : S.tag(Discord.ButtonStyleTypes.SECONDARY),
  custom_id: CustomIdOutput,
  emoji    : S.optional(EmojiOutput),
  label    : S.optional(Str80),
  disabled : S.optional(S.Boolean),
});

export const ButtonSuccessInput = S.Struct({
  id       : Int32IdInput,
  type     : S.tag(Discord.MessageComponentTypes.BUTTON),
  style    : S.tag(Discord.ButtonStyleTypes.SUCCESS),
  custom_id: CustomIdInput,
  emoji    : S.optional(EmojiInput),
  label    : S.optional(S.String),
  disabled : S.optional(S.Boolean),
});
export const ButtonSuccessOutput = S.Struct({
  id       : Int32IdOutput,
  type     : S.tag(Discord.MessageComponentTypes.BUTTON),
  style    : S.tag(Discord.ButtonStyleTypes.SUCCESS),
  custom_id: CustomIdOutput,
  emoji    : S.optional(EmojiOutput),
  label    : S.optional(Str80),
  disabled : S.optional(S.Boolean),
});

export const ButtonDangerInput = S.Struct({
  id       : Int32IdInput,
  type     : S.tag(Discord.MessageComponentTypes.BUTTON),
  style    : S.tag(Discord.ButtonStyleTypes.DANGER),
  custom_id: CustomIdInput,
  emoji    : S.optional(EmojiInput),
  label    : S.optional(S.String),
  disabled : S.optional(S.Boolean),
});
export const ButtonDangerOutput = S.Struct({
  id       : Int32IdOutput,
  type     : S.tag(Discord.MessageComponentTypes.BUTTON),
  style    : S.tag(Discord.ButtonStyleTypes.DANGER),
  custom_id: CustomIdOutput,
  emoji    : S.optional(EmojiOutput),
  label    : S.optional(Str80),
  disabled : S.optional(S.Boolean),
});

export const ButtonLinkInput = S.Struct({
  id      : Int32IdInput,
  type    : S.tag(Discord.MessageComponentTypes.BUTTON),
  style   : S.tag(Discord.ButtonStyleTypes.LINK),
  url     : S.String,
  emoji   : S.optional(EmojiInput),
  label   : S.optional(S.String),
  disabled: S.optional(S.Boolean),
});
export const ButtonLinkOutput = S.Struct({
  id      : Int32IdOutput,
  type    : S.tag(Discord.MessageComponentTypes.BUTTON),
  style   : S.tag(Discord.ButtonStyleTypes.LINK),
  url     : Str512,
  emoji   : S.optional(EmojiOutput),
  label   : S.optional(Str80),
  disabled: S.optional(S.Boolean),
});

export const ButtonPremiumInput = S.Struct({
  id    : Int32IdInput,
  type  : S.tag(Discord.MessageComponentTypes.BUTTON),
  style : S.tag(Discord.ButtonStyleTypes.PREMIUM),
  sku_id: S.String,
});
export const ButtonPremiumOutput = S.Struct({
  id      : Int32IdOutput,
  type    : S.tag(Discord.MessageComponentTypes.BUTTON),
  style   : S.tag(Discord.ButtonStyleTypes.PREMIUM),
  sku_id  : S.String,
  disabled: S.optional(S.Boolean),
});

export const ButtonInput = S.Union(
  ButtonPrimaryInput,
  ButtonSecondaryInput,
  ButtonSuccessInput,
  ButtonDangerInput,
  ButtonLinkInput,
  ButtonPremiumInput,
);
export const ButtonOutput = S.Union(
  ButtonPrimaryOutput,
  ButtonSecondaryOutput,
  ButtonSuccessOutput,
  ButtonDangerOutput,
  ButtonLinkOutput,
  ButtonPremiumOutput,
);

export const ButtonRowInput = S.Struct({
  id        : Int32IdInput,
  type      : S.tag(Discord.MessageComponentTypes.ACTION_ROW),
  components: S.Array(ButtonInput),
});
export const ButtonRowOutput = S.Struct({
  id        : Int32IdOutput,
  type      : S.tag(Discord.MessageComponentTypes.ACTION_ROW),
  components: S.Array(ButtonOutput).pipe(S.minItems(1), S.maxItems(5)),
});

export const StringSelectOptionInput = S.Struct({
  value      : S.String,
  label      : S.String,
  description: S.optional(S.String),
  default    : S.optional(S.Boolean),
  emoji      : S.optional(EmojiInput),
});
export const StringSelectOptionOutput = S.Struct({
  value      : Str100,
  label      : Str100,
  description: S.optional(Str100),
  default    : S.optional(S.Boolean),
  emoji      : S.optional(EmojiOutput),
});

export const StringSelectInput = S.Struct({
  id         : Int32IdInput,
  type       : S.tag(Discord.MessageComponentTypes.STRING_SELECT),
  custom_id  : CustomIdInput,
  placeholder: S.optional(S.String),
  options    : S.Array(StringSelectOptionInput),
});
export const StringSelectData = S.Struct({
  id            : Int32IdOutput,
  component_type: S.tag(Discord.MessageComponentTypes.STRING_SELECT),
  custom_id     : CustomIdInput,
  values        : S.Array(S.String),
});
export const StringSelectOutput = S.Struct({
  type       : S.tag(Discord.MessageComponentTypes.STRING_SELECT),
  custom_id  : CustomIdOutput,
  options    : S.Array(StringSelectOptionOutput).pipe(S.minItems(1), S.maxItems(25)),
  placeholder: S.optional(Str100),
  min_values : S.optional(Int0to25),
  max_values : S.optional(Int1to25),
  disabled   : S.optional(S.Boolean),
});

export const ChannelSelectValueInput = S.Struct({
  type: S.tag('channel'),
  id  : S.String,
});
export const ChannelSelectValueOutput = S.Struct({
  type: S.tag('channel'),
  id  : S.String,
});

export const ChannelSelectInput = S.Struct({
  id            : Int32IdInput,
  type          : S.tag(Discord.MessageComponentTypes.CHANNEL_SELECT),
  custom_id     : CustomIdInput,
  placeholder   : S.optional(S.String),
  default_values: S.Array(ChannelSelectValueInput),
  channel_types : S.optional(S.Array(S.Number)),
  min_values    : S.optional(S.Number),
  max_values    : S.optional(S.Number),
  disabled      : S.optional(S.Boolean),
});
export const ChannelSelectData = S.Struct({
  component_type: S.tag(Discord.MessageComponentTypes.CHANNEL_SELECT),
  custom_id     : CustomIdInput,
  values        : S.Array(S.String),
});
export const ChannelSelectOutput = S.Struct({
  id            : Int32IdOutput,
  type          : S.tag(Discord.MessageComponentTypes.CHANNEL_SELECT),
  custom_id     : CustomIdOutput,
  default_values: S.Array(ChannelSelectValueOutput).pipe(S.maxItems(25)),
  channel_types : S.optional(S.Array(S.Enums(Discord.ChannelTypes))),
  placeholder   : S.optional(Str100),
  min_values    : S.optional(Int0to25),
  max_values    : S.optional(Int1to25),
  disabled      : S.optional(S.Boolean),
});

export const RoleSelectValueInput = S.Struct({
  type: S.tag('role'),
  id  : S.String,
});
export const RoleSelectValueOutput = S.Struct({
  type: S.tag('role'),
  id  : S.String,
});

export const RoleSelectInput = S.Struct({
  id            : Int32IdInput,
  type          : S.tag(Discord.MessageComponentTypes.ROLE_SELECT),
  custom_id     : CustomIdInput,
  placeholder   : S.optional(S.String),
  default_values: S.Array(RoleSelectValueInput),
  min_values    : S.optional(S.Number),
  max_values    : S.optional(S.Number),
  disabled      : S.optional(S.Boolean),
});
export const RoleSelectData = S.Struct({
  component_type: S.tag(Discord.MessageComponentTypes.ROLE_SELECT),
  custom_id     : CustomIdInput,
  values        : S.Array(S.String),
});
export const RoleSelectOutput = S.Struct({
  id            : Int32IdOutput,
  type          : S.tag(Discord.MessageComponentTypes.ROLE_SELECT),
  custom_id     : CustomIdOutput,
  default_values: S.Array(RoleSelectValueOutput).pipe(S.maxItems(25)),
  placeholder   : S.optional(Str100),
  min_values    : S.optional(Int0to25),
  max_values    : S.optional(Int1to25),
  disabled      : S.optional(S.Boolean),
});

export const UserSelectValueInput = S.Struct({
  type: S.tag('user'),
  id  : S.String,
});
export const UserSelectValueOutput = S.Struct({
  type: S.tag('user'),
  id  : S.String,
});

export const UserSelectInput = S.Struct({
  id            : Int32IdInput,
  type          : S.tag(Discord.MessageComponentTypes.USER_SELECT),
  custom_id     : CustomIdInput,
  placeholder   : S.optional(S.String),
  default_values: S.Array(UserSelectValueInput),
  min_values    : S.optional(S.Number),
  max_values    : S.optional(S.Number),
  disabled      : S.optional(S.Boolean),
});
export const UserSelectData = S.Struct({
  component_type: S.tag(Discord.MessageComponentTypes.USER_SELECT),
  custom_id     : CustomIdInput,
  values        : S.Array(S.String),
});
export const UserSelectOutput = S.Struct({
  id            : Int32IdOutput,
  type          : S.tag(Discord.MessageComponentTypes.USER_SELECT),
  custom_id     : CustomIdOutput,
  default_values: S.Array(UserSelectValueOutput).pipe(S.maxItems(25)),
  placeholder   : S.optional(Str100),
  min_values    : S.optional(Int0to25),
  max_values    : S.optional(Int1to25),
  disabled      : S.optional(S.Boolean),
});

export const MentionableSelectValueInput = S.Union(ChannelSelectValueInput, RoleSelectValueInput, UserSelectValueInput);
export const MentionableSelectValueOutput = S.Union(ChannelSelectValueOutput, RoleSelectValueOutput, UserSelectValueOutput);

export const MentionableSelectInput = S.Struct({
  id            : Int32IdInput,
  type          : S.tag(Discord.MessageComponentTypes.MENTIONABLE_SELECT),
  custom_id     : CustomIdInput,
  placeholder   : S.optional(S.String),
  default_values: S.Array(MentionableSelectValueInput),
  min_values    : S.optional(S.Number),
  max_values    : S.optional(S.Number),
  disabled      : S.optional(S.Boolean),
});
export const MentionableSelectData = S.Struct({
  component_type: S.tag(Discord.MessageComponentTypes.MENTIONABLE_SELECT),
  custom_id     : CustomIdInput,
  values        : S.Array(S.String),
});
export const MentionableSelectOutput = S.Struct({
  id            : Int32IdOutput,
  type          : S.tag(Discord.MessageComponentTypes.MENTIONABLE_SELECT),
  custom_id     : CustomIdOutput,
  default_values: S.Array(MentionableSelectValueOutput).pipe(S.maxItems(25)),
  placeholder   : S.optional(Str100),
  min_values    : S.optional(Int0to25),
  max_values    : S.optional(Int1to25),
  disabled      : S.optional(S.Boolean),
});

export const SelectMenuInput = S.Union(
  StringSelectInput,
  ChannelSelectInput,
  RoleSelectInput,
  UserSelectInput,
  MentionableSelectInput,
);
export const SelectMenuData = S.Union(
  StringSelectData,
  ChannelSelectData,
  RoleSelectData,
  UserSelectData,
  MentionableSelectData,
);
export const SelectMenuOutput = S.Union(
  StringSelectOutput,
  ChannelSelectOutput,
  RoleSelectOutput,
  UserSelectOutput,
  MentionableSelectOutput,
);

export const SelectRowInput = S.Struct({
  id        : Int32IdInput,
  type      : S.tag(Discord.MessageComponentTypes.ACTION_ROW),
  components: S.Array(SelectMenuInput),
});
export const SelectRowOutput = S.Struct({
  id        : Int32IdOutput,
  type      : S.tag(Discord.MessageComponentTypes.ACTION_ROW),
  components: S.Array(SelectMenuOutput).pipe(S.itemsCount(1)),
});

export const TextDisplayInput = S.Struct({
  id     : Int32IdInput,
  type   : S.tag(Discord.MessageComponentTypes.TEXT_DISPLAY),
  content: S.String,
});
export const TextDisplayOutput = S.Struct({
  id     : Int32IdOutput,
  type   : S.tag(Discord.MessageComponentTypes.TEXT_DISPLAY),
  content: Str1000,
});

export const ThumbnailInput = S.Struct({
  id         : Int32IdInput,
  type       : S.tag(Discord.MessageComponentTypes.THUMBNAIL),
  media      : UnfurledMediaItemInput,
  description: S.optional(S.String),
  spoiler    : S.optional(S.Boolean),
});
export const ThumbnailOutput = S.Struct({
  id         : Int32IdOutput,
  type       : S.tag(Discord.MessageComponentTypes.THUMBNAIL),
  media      : UnfurledMediaItemOutput,
  description: S.optional(Str1024),
  spoiler    : S.optional(S.Boolean),
});

export const SectionInput = S.Struct({
  id        : Int32IdInput,
  type      : S.tag(Discord.MessageComponentTypes.SECTION),
  components: S.Array(TextDisplayInput),
  accessory : S.Union(ButtonInput, ThumbnailInput),
});
export const SectionOutput = S.Struct({
  id        : Int32IdOutput,
  type      : S.tag(Discord.MessageComponentTypes.SECTION),
  components: S.Array(TextDisplayOutput).pipe(S.minItems(1), S.maxItems(3)),
  accessory : S.Union(ButtonOutput, ThumbnailOutput),
});

export const MediaGalleryItemInput = S.Struct({
  media      : UnfurledMediaItemInput,
  description: S.optional(S.String),
  spoiler    : S.optional(S.Boolean),
});
export const MediaGalleryItemOutput = S.Struct({
  media      : UnfurledMediaItemOutput,
  description: S.optional(Str1024),
  spoiler    : S.optional(S.Boolean),
});

export const MediaGalleryInput = S.Struct({
  id   : Int32IdInput,
  type : S.tag(Discord.MessageComponentTypes.MEDIA_GALLERY),
  media: S.Array(MediaGalleryItemInput),
});
export const MediaGalleryOutput = S.Struct({
  id   : Int32IdOutput,
  type : S.tag(Discord.MessageComponentTypes.MEDIA_GALLERY),
  media: S.Array(MediaGalleryItemOutput).pipe(S.minItems(1), S.maxItems(10)),
});

export const FileInput = S.Struct({
  id     : Int32IdInput,
  type   : S.tag(Discord.MessageComponentTypes.FILE),
  file   : UnfurledMediaItemInput,
  spoiler: S.optional(S.Boolean),
  name   : S.String,
  size   : S.Number,
});
export const FileOutput = S.Struct({
  id     : Int32IdOutput,
  type   : S.tag(Discord.MessageComponentTypes.FILE),
  file   : UnfurledMediaItemOutput,
  spoiler: S.optional(S.Boolean),
});

export const SeparatorInput = S.Struct({
  id     : Int32IdInput,
  type   : S.tag(Discord.MessageComponentTypes.SEPARATOR),
  divider: S.optional(S.Boolean),
  spacing: S.optional(S.Enums(Discord.MessageComponentSeparatorSpacingSize)),
});
export const SeparatorOutput = S.Struct({
  id     : Int32IdOutput,
  type   : S.tag(Discord.MessageComponentTypes.SEPARATOR),
  divider: S.optional(S.Boolean),
  spacing: S.optional(S.Enums(Discord.MessageComponentSeparatorSpacingSize)),
});

/**
 * https://discord.com/channels/613425648685547541/1364347506200416307/1366842924230508557
 */
export const ContainerInput = S.Struct({
  id          : Int32IdInput,
  type        : S.tag(Discord.MessageComponentTypes.CONTAINER),
  components  : S.Array(S.Union(ButtonRowInput, SelectRowInput, TextDisplayInput, SectionInput, MediaGalleryInput, FileInput, SeparatorInput)),
  accent_color: S.optional(S.Number),
  spoiler     : S.optional(S.Boolean),
});
export const ContainerOutput = S.Struct({
  id          : Int32IdOutput,
  type        : S.tag(Discord.MessageComponentTypes.CONTAINER),
  components  : S.Array(S.Union(ButtonRowOutput, SelectRowOutput, TextDisplayOutput, SectionOutput, MediaGalleryOutput, FileOutput, SeparatorOutput)),
  accent_color: S.optional(HexColor),
  spoiler     : S.optional(S.Boolean),
});

export const MessageV2Input = S.Struct({
  flags     : S.tag(Discord.MessageFlags.IsComponentsV2),
  components: S.Array(S.Union(ButtonRowInput, SelectRowInput, TextDisplayInput, SectionInput, MediaGalleryInput, FileInput, SeparatorInput, ContainerInput)),
});
export const MessageV2Output = S.Struct({
  flags     : S.tag(Discord.MessageFlags.IsComponentsV2),
  components: S.Array(S.Union(ButtonRowOutput, SelectRowOutput, TextDisplayOutput, SectionOutput, MediaGalleryOutput, FileOutput, SeparatorOutput, ContainerOutput)),
});

export const EphemeralV2Input = S.Struct({
  ...MessageV2Input.fields,
  flags: S.tag(Discord.MessageFlags.Ephemeral | Discord.MessageFlags.IsComponentsV2),
});
export const EphemeralV2Output = S.Struct({
  ...MessageV2Output.fields,
  flags: S.tag(Discord.MessageFlags.Ephemeral | Discord.MessageFlags.IsComponentsV2),
});

export const EmbedAuthorInput = S.Struct({
  name: S.String,
});

export const EmbedAuthorOutput = S.Struct({
  name: S.String.pipe(S.maxLength(256)),
});

export const EmbedFieldInput = S.Struct({
  name  : S.String,
  value : S.String,
  inline: S.optional(S.Boolean),
});

export const EmbedFieldOutput = S.Struct({
  name  : Str256,
  value : Str1024,
  inline: S.optional(S.Boolean),
});

export const EmbedFooterInput = S.Struct({
  text: S.String,
});

export const EmbedFooterOutput = S.Struct({
  text: Str2048,
});

export const EmbedImageInput = S.Struct({
  url: S.String,
});

export const EmbedImageOutput = S.Struct({
  url: S.String,
});

export const EmbedInput = S.Struct({
  color      : S.optional(S.Number),
  image      : S.optional(EmbedImageInput),
  author     : S.optional(EmbedAuthorInput),
  title      : S.optional(S.String),
  description: S.optional(S.String),
  fields     : S.optional(S.Array(EmbedFieldInput)),
  footer     : S.optional(EmbedFooterInput),
});

export const EmbedOutput = S.Struct({
  color      : S.optional(HexColor),
  image      : S.optional(EmbedImageOutput),
  author     : S.optional(EmbedAuthorOutput),
  title      : S.optional(Str256),
  description: S.optional(Str4096),
  fields     : S.optional(S.Array(EmbedFieldOutput).pipe(S.maxItems(25))),
  footer     : S.optional(EmbedFooterOutput),
});

export const MessageV1Input = S.Struct({
  content   : S.optional(S.String),
  embeds    : S.optional(S.Array(EmbedInput)),
  components: S.optional(S.Array(S.Union(ButtonRowInput, SelectRowInput))),
});
export const MessageV1Output = S.Struct({
  content   : S.optional(Str2000),
  embeds    : S.optional(S.Array(EmbedInput).pipe(S.maxItems(10))),
  components: S.optional(S.Array(S.Union(ButtonRowOutput, SelectRowOutput)).pipe(S.maxItems(5))),
});

export const EphemeralV1Input = S.Struct({
  ...MessageV1Input.fields,
  flags: S.tag(Discord.MessageFlags.Ephemeral),
});
export const EphemeralV1Output = S.Struct({
  ...MessageV1Output.fields,
  flags: S.tag(Discord.MessageFlags.Ephemeral),
});

export const TextInputData = S.Struct({
  id       : Int32IdInput,
  type     : S.tag(Discord.MessageComponentTypes.TEXT_INPUT),
  custom_id: CustomIdInput,
  value    : S.String,
});
export const TextInputShortOutput = S.Struct({
  id         : Int32IdOutput,
  type       : S.tag(Discord.MessageComponentTypes.TEXT_INPUT),
  style      : S.tag(Discord.TextInputStyleTypes.SHORT),
  custom_id  : CustomIdOutput,
  value      : S.optional(Str4000),
  label      : S.optional(Str45),
  placeholder: S.optional(Str100),
  required   : S.optional(S.Boolean),
  min_length : S.optional(Int0to4000),
  max_length : S.optional(Int1to4000),
});
export const TextInputParagraphOutput = S.Struct({
  id         : Int32IdOutput,
  type       : S.tag(Discord.MessageComponentTypes.TEXT_INPUT),
  style      : S.tag(Discord.TextInputStyleTypes.PARAGRAPH),
  custom_id  : CustomIdOutput,
  value      : S.optional(Str4000),
  label      : S.optional(Str45),
  placeholder: S.optional(Str100),
  required   : S.optional(S.Boolean),
  min_length : S.optional(Int0to4000),
  max_length : S.optional(Int1to4000),
});
export const TextInputOutput = S.Struct({
  id         : Int32IdOutput,
  type       : S.tag(Discord.MessageComponentTypes.TEXT_INPUT),
  style      : S.Enums(Discord.TextInputStyleTypes).pipe(S.optionalWith({default: () => Discord.TextInputStyleTypes.SHORT})),
  custom_id  : CustomIdOutput,
  value      : S.optional(Str4000),
  label      : S.optional(Str45),
  placeholder: S.optional(Str100),
  required   : S.optional(S.Boolean),
  min_length : S.optional(Int0to4000),
  max_length : S.optional(Int1to4000),
});

export const ModalRowData = S.Struct({
  id        : Int32IdInput,
  type      : S.tag(Discord.MessageComponentTypes.ACTION_ROW),
  components: S.Array(TextInputData),
});
export const ModalRowOutput = S.Struct({
  id        : Int32IdOutput,
  type      : S.tag(Discord.MessageComponentTypes.ACTION_ROW),
  components: S.Array(S.Union(TextInputShortOutput, TextInputParagraphOutput)).pipe(S.itemsCount(1)),
});

export const ModalData = S.Struct({
  custom_id : CustomIdInput,
  components: S.Array(ModalRowData),
});
export const ModalOutput = S.Struct({
  custom_id : CustomIdOutput,
  title     : Str45,
  components: S.Array(ModalRowOutput).pipe(S.minItems(1), S.maxItems(5)),
});

export const
  bold      = (s: string) => `**${s}**`,
  italic    = (s: string) => `*${s}*`,
  underline = (s: string) => `__${s}__`,
  strike    = (s: string) => `~~${s}~~`,
  spoiler   = (s: string) => `||${s}||`,
  code      = (s: string) => `\`${s}\``,
  newline = (s: string) => `\n${s}`,
  quote     = (s: string) => `> ${s}`,
  quotes    = (s: string) => `>> ${s}`,
  hide      = (s: string) => `<${s}>`,
  mask      = (s: string, t: string) => ``,
  indent    = (s: string) => `  ${s}`;
