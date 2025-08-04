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

export type EmojiInput = typeof EmojiInput.Type;
export const EmojiInput = S.Struct({
  id      : S.optional(S.String),
  name    : S.optional(S.String),
  animated: S.optional(S.Boolean),
});
export type EmojiOutput = typeof EmojiOutput.Type;
export const EmojiOutput = S.Struct({
  id      : S.optional(S.String),
  name    : S.optional(S.String),
  animated: S.optional(S.Boolean),
});

/**
 * @link https://discord.com/developers/docs/components/reference#unfurled-media-item-structure
 */
export type UnfurledMediaItemInput = typeof UnfurledMediaItemInput.Type;
export const UnfurledMediaItemInput = S.Struct({
  url          : S.String,
  proxy_url    : S.optional(S.String),
  height       : S.optional(S.Number),
  width        : S.optional(S.Number),
  content_type : S.optional(S.String),
  attachment_id: S.optional(S.String),
});

export type UnfurledMediaItemOutput = typeof UnfurledMediaItemOutput.Type;
export const UnfurledMediaItemOutput = S.Struct({
  url: S.String,
});

export type ButtonData = typeof ButtonData.Type;
export const ButtonData = S.Struct({
  component_type: S.tag(Discord.MessageComponentTypes.BUTTON),
  custom_id     : CustomIdInput,
});

export type ButtonPrimaryInput = typeof ButtonPrimaryInput.Type;
export const ButtonPrimaryInput = S.Struct({
  id       : Int32IdInput,
  type     : S.tag(Discord.MessageComponentTypes.BUTTON),
  style    : S.tag(Discord.ButtonStyleTypes.PRIMARY),
  custom_id: CustomIdInput,
  emoji    : S.optional(EmojiInput),
  label    : S.optional(S.String),
  disabled : S.optional(S.Boolean),
});
export type ButtonPrimaryOutput = typeof ButtonPrimaryOutput.Type;
export const ButtonPrimaryOutput = S.Struct({
  id       : Int32IdOutput,
  type     : S.tag(Discord.MessageComponentTypes.BUTTON),
  style    : S.tag(Discord.ButtonStyleTypes.PRIMARY),
  custom_id: CustomIdOutput,
  emoji    : S.optional(EmojiOutput),
  label    : S.optional(Str80),
  disabled : S.optional(S.Boolean),
});

export type ButtonSecondaryInput = typeof ButtonSecondaryInput.Type;
export const ButtonSecondaryInput = S.Struct({
  id       : Int32IdInput,
  type     : S.tag(Discord.MessageComponentTypes.BUTTON),
  style    : S.tag(Discord.ButtonStyleTypes.SECONDARY),
  custom_id: CustomIdInput,
  emoji    : S.optional(EmojiInput),
  label    : S.optional(S.String),
  disabled : S.optional(S.Boolean),
});
export type ButtonSecondaryOutput = typeof ButtonSecondaryOutput.Type;
export const ButtonSecondaryOutput = S.Struct({
  id       : Int32IdOutput,
  type     : S.tag(Discord.MessageComponentTypes.BUTTON),
  style    : S.tag(Discord.ButtonStyleTypes.SECONDARY),
  custom_id: CustomIdOutput,
  emoji    : S.optional(EmojiOutput),
  label    : S.optional(Str80),
  disabled : S.optional(S.Boolean),
});

export type ButtonSuccessInput = typeof ButtonSuccessInput.Type;
export const ButtonSuccessInput = S.Struct({
  id       : Int32IdInput,
  type     : S.tag(Discord.MessageComponentTypes.BUTTON),
  style    : S.tag(Discord.ButtonStyleTypes.SUCCESS),
  custom_id: CustomIdInput,
  emoji    : S.optional(EmojiInput),
  label    : S.optional(S.String),
  disabled : S.optional(S.Boolean),
});
export type ButtonSuccessOutput = typeof ButtonSuccessOutput.Type;
export const ButtonSuccessOutput = S.Struct({
  id       : Int32IdOutput,
  type     : S.tag(Discord.MessageComponentTypes.BUTTON),
  style    : S.tag(Discord.ButtonStyleTypes.SUCCESS),
  custom_id: CustomIdOutput,
  emoji    : S.optional(EmojiOutput),
  label    : S.optional(Str80),
  disabled : S.optional(S.Boolean),
});

export type ButtonDangerInput = typeof ButtonDangerInput.Type;
export const ButtonDangerInput = S.Struct({
  id       : Int32IdInput,
  type     : S.tag(Discord.MessageComponentTypes.BUTTON),
  style    : S.tag(Discord.ButtonStyleTypes.DANGER),
  custom_id: CustomIdInput,
  emoji    : S.optional(EmojiInput),
  label    : S.optional(S.String),
  disabled : S.optional(S.Boolean),
});
export type ButtonDangerOutput = typeof ButtonDangerOutput.Type;
export const ButtonDangerOutput = S.Struct({
  id       : Int32IdOutput,
  type     : S.tag(Discord.MessageComponentTypes.BUTTON),
  style    : S.tag(Discord.ButtonStyleTypes.DANGER),
  custom_id: CustomIdOutput,
  emoji    : S.optional(EmojiOutput),
  label    : S.optional(Str80),
  disabled : S.optional(S.Boolean),
});

export type ButtonLinkInput = typeof ButtonLinkInput.Type;
export const ButtonLinkInput = S.Struct({
  id      : Int32IdInput,
  type    : S.tag(Discord.MessageComponentTypes.BUTTON),
  style   : S.tag(Discord.ButtonStyleTypes.LINK),
  url     : S.String,
  emoji   : S.optional(EmojiInput),
  label   : S.optional(S.String),
  disabled: S.optional(S.Boolean),
});
export type ButtonLinkOutput = typeof ButtonLinkOutput.Type;
export const ButtonLinkOutput = S.Struct({
  id      : Int32IdOutput,
  type    : S.tag(Discord.MessageComponentTypes.BUTTON),
  style   : S.tag(Discord.ButtonStyleTypes.LINK),
  url     : Str512,
  emoji   : S.optional(EmojiOutput),
  label   : S.optional(Str80),
  disabled: S.optional(S.Boolean),
});

export type ButtonPremiumInput = typeof ButtonPremiumInput.Type;
export const ButtonPremiumInput = S.Struct({
  id    : Int32IdInput,
  type  : S.tag(Discord.MessageComponentTypes.BUTTON),
  style : S.tag(Discord.ButtonStyleTypes.PREMIUM),
  sku_id: S.String,
});
export type ButtonPremiumOutput = typeof ButtonPremiumOutput.Type;
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

export type ButtonRowInput = typeof ButtonRowInput.Type;
export const ButtonRowInput = S.Struct({
  id        : Int32IdInput,
  type      : S.tag(Discord.MessageComponentTypes.ACTION_ROW),
  components: S.Array(ButtonInput),
});
export type ButtonRowOutput = typeof ButtonRowOutput.Type;
export const ButtonRowOutput = S.Struct({
  id        : Int32IdOutput,
  type      : S.tag(Discord.MessageComponentTypes.ACTION_ROW),
  components: S.Array(ButtonOutput).pipe(S.minItems(1), S.maxItems(5)),
});

export type StringSelectOptionInput = typeof StringSelectOptionInput.Type;
export const StringSelectOptionInput = S.Struct({
  value      : S.String,
  label      : S.String,
  description: S.optional(S.String),
  default    : S.optional(S.Boolean),
  emoji      : S.optional(EmojiInput),
});
export type StringSelectOptionOutput = typeof StringSelectOptionOutput.Type;
export const StringSelectOptionOutput = S.Struct({
  value      : Str100,
  label      : Str100,
  description: S.optional(Str100),
  default    : S.optional(S.Boolean),
  emoji      : S.optional(EmojiOutput),
});

export type StringSelectInput = typeof StringSelectInput.Type;
export const StringSelectInput = S.Struct({
  id         : Int32IdInput,
  type       : S.tag(Discord.MessageComponentTypes.STRING_SELECT),
  custom_id  : CustomIdInput,
  placeholder: S.optional(S.String),
  options    : S.Array(StringSelectOptionInput),
});
export type StringSelectData = typeof StringSelectData.Type;
export const StringSelectData = S.Struct({
  id            : Int32IdOutput,
  component_type: S.tag(Discord.MessageComponentTypes.STRING_SELECT),
  custom_id     : CustomIdInput,
  values        : S.Array(S.String),
});
export type StringSelectOutput = typeof StringSelectOutput.Type;
export const StringSelectOutput = S.Struct({
  type       : S.tag(Discord.MessageComponentTypes.STRING_SELECT),
  custom_id  : CustomIdOutput,
  options    : S.Array(StringSelectOptionOutput).pipe(S.minItems(1), S.maxItems(25)),
  placeholder: S.optional(Str100),
  min_values : S.optional(Int0to25),
  max_values : S.optional(Int1to25),
  disabled   : S.optional(S.Boolean),
});

export type ChannelSelectValueInput = typeof ChannelSelectValueInput.Type;
export const ChannelSelectValueInput = S.Struct({
  type: S.tag('channel'),
  id  : S.String,
});
export type ChannelSelectValueOutput = typeof ChannelSelectValueOutput.Type;
export const ChannelSelectValueOutput = S.Struct({
  type: S.tag('channel'),
  id  : S.String,
});

export type ChannelSelectInput = typeof ChannelSelectInput.Type;
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
export type ChannelSelectData = typeof ChannelSelectData.Type;
export const ChannelSelectData = S.Struct({
  component_type: S.tag(Discord.MessageComponentTypes.CHANNEL_SELECT),
  custom_id     : CustomIdInput,
  values        : S.Array(S.String),
});
export type ChannelSelectOutput = typeof ChannelSelectOutput.Type;
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

export type RoleSelectValueInput = typeof RoleSelectValueInput.Type;
export const RoleSelectValueInput = S.Struct({
  type: S.tag('role'),
  id  : S.String,
});
export type RoleSelectValueOutput = typeof RoleSelectValueOutput.Type;
export const RoleSelectValueOutput = S.Struct({
  type: S.tag('role'),
  id  : S.String,
});

export type RoleSelectInput = typeof RoleSelectInput.Type;
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
export type RoleSelectData = typeof RoleSelectData.Type;
export const RoleSelectData = S.Struct({
  component_type: S.tag(Discord.MessageComponentTypes.ROLE_SELECT),
  custom_id     : CustomIdInput,
  values        : S.Array(S.String),
});
export type RoleSelectOutput = typeof RoleSelectOutput.Type;
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

export type UserSelectValueInput = typeof UserSelectValueInput.Type;
export const UserSelectValueInput = S.Struct({
  type: S.tag('user'),
  id  : S.String,
});
export type UserSelectValueOutput = typeof UserSelectValueOutput.Type;
export const UserSelectValueOutput = S.Struct({
  type: S.tag('user'),
  id  : S.String,
});

export type UserSelectInput = typeof UserSelectInput.Type;
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
export type UserSelectData = typeof UserSelectData.Type;
export const UserSelectData = S.Struct({
  component_type: S.tag(Discord.MessageComponentTypes.USER_SELECT),
  custom_id     : CustomIdInput,
  values        : S.Array(S.String),
});
export type UserSelectOutput = typeof UserSelectOutput.Type;
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

export type MentionableSelectInput = typeof MentionableSelectInput.Type;
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
export type MentionableSelectData = typeof MentionableSelectData.Type;
export const MentionableSelectData = S.Struct({
  component_type: S.tag(Discord.MessageComponentTypes.MENTIONABLE_SELECT),
  custom_id     : CustomIdInput,
  values        : S.Array(S.String),
});
export type MentionableSelectOutput = typeof MentionableSelectOutput.Type;
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

export type SelectRowInput = typeof SelectRowInput.Type;
export const SelectRowInput = S.Struct({
  id        : Int32IdInput,
  type      : S.tag(Discord.MessageComponentTypes.ACTION_ROW),
  components: S.Array(SelectMenuInput),
});
export type SelectRowOutput = typeof SelectRowOutput.Type;
export const SelectRowOutput = S.Struct({
  id        : Int32IdOutput,
  type      : S.tag(Discord.MessageComponentTypes.ACTION_ROW),
  components: S.Array(SelectMenuOutput).pipe(S.itemsCount(1)),
});

export type TextDisplayInput = typeof TextDisplayInput.Type;
export const TextDisplayInput = S.Struct({
  id     : Int32IdInput,
  type   : S.tag(Discord.MessageComponentTypes.TEXT_DISPLAY),
  content: S.String,
});
export type TextDisplayOutput = typeof TextDisplayOutput.Type;
export const TextDisplayOutput = S.Struct({
  id     : Int32IdOutput,
  type   : S.tag(Discord.MessageComponentTypes.TEXT_DISPLAY),
  content: Str1000,
});

export type ThumbnailInput = typeof ThumbnailInput.Type;
export const ThumbnailInput = S.Struct({
  id         : Int32IdInput,
  type       : S.tag(Discord.MessageComponentTypes.THUMBNAIL),
  media      : UnfurledMediaItemInput,
  description: S.optional(S.String),
  spoiler    : S.optional(S.Boolean),
});
export type ThumbnailOutput = typeof ThumbnailOutput.Type;
export const ThumbnailOutput = S.Struct({
  id         : Int32IdOutput,
  type       : S.tag(Discord.MessageComponentTypes.THUMBNAIL),
  media      : UnfurledMediaItemOutput,
  description: S.optional(Str1024),
  spoiler    : S.optional(S.Boolean),
});

export type SectionInput = typeof SectionInput.Type;
export const SectionInput = S.Struct({
  id        : Int32IdInput,
  type      : S.tag(Discord.MessageComponentTypes.SECTION),
  components: S.Array(TextDisplayInput),
  accessory : S.Union(ButtonInput, ThumbnailInput),
});
export type SectionOutput = typeof SectionOutput.Type;
export const SectionOutput = S.Struct({
  id        : Int32IdOutput,
  type      : S.tag(Discord.MessageComponentTypes.SECTION),
  components: S.Array(TextDisplayOutput).pipe(S.minItems(1), S.maxItems(3)),
  accessory : S.Union(ButtonOutput, ThumbnailOutput),
});

export type MediaGalleryItemInput = typeof MediaGalleryItemInput.Type;
export const MediaGalleryItemInput = S.Struct({
  media      : UnfurledMediaItemInput,
  description: S.optional(S.String),
  spoiler    : S.optional(S.Boolean),
});
export type MediaGalleryItemOutput = typeof MediaGalleryItemOutput.Type;
export const MediaGalleryItemOutput = S.Struct({
  media      : UnfurledMediaItemOutput,
  description: S.optional(Str1024),
  spoiler    : S.optional(S.Boolean),
});

export type MediaGalleryInput = typeof MediaGalleryInput.Type;
export const MediaGalleryInput = S.Struct({
  id   : Int32IdInput,
  type : S.tag(Discord.MessageComponentTypes.MEDIA_GALLERY),
  media: S.Array(MediaGalleryItemInput),
});
export type MediaGalleryOutput = typeof MediaGalleryOutput.Type;
export const MediaGalleryOutput = S.Struct({
  id   : Int32IdOutput,
  type : S.tag(Discord.MessageComponentTypes.MEDIA_GALLERY),
  media: S.Array(MediaGalleryItemOutput).pipe(S.minItems(1), S.maxItems(10)),
});

export type FileInput = typeof FileInput.Type;
export const FileInput = S.Struct({
  id     : Int32IdInput,
  type   : S.tag(Discord.MessageComponentTypes.FILE),
  file   : UnfurledMediaItemInput,
  spoiler: S.optional(S.Boolean),
  name   : S.String,
  size   : S.Number,
});
export type FileOutput = typeof FileOutput.Type;
export const FileOutput = S.Struct({
  id     : Int32IdOutput,
  type   : S.tag(Discord.MessageComponentTypes.FILE),
  file   : UnfurledMediaItemOutput,
  spoiler: S.optional(S.Boolean),
});

export type SeparatorInput = typeof SeparatorInput.Type;
export const SeparatorInput = S.Struct({
  id     : Int32IdInput,
  type   : S.tag(Discord.MessageComponentTypes.SEPARATOR),
  divider: S.optional(S.Boolean),
  spacing: S.optional(S.Enums(Discord.MessageComponentSeparatorSpacingSize)),
});
export type SeparatorOutput = typeof SeparatorOutput.Type;
export const SeparatorOutput = S.Struct({
  id     : Int32IdOutput,
  type   : S.tag(Discord.MessageComponentTypes.SEPARATOR),
  divider: S.optional(S.Boolean),
  spacing: S.optional(S.Enums(Discord.MessageComponentSeparatorSpacingSize)),
});

/**
 * https://discord.com/channels/613425648685547541/1364347506200416307/1366842924230508557
 */
export type ContainerInput = typeof ContainerInput.Type;
export const ContainerInput = S.Struct({
  id          : Int32IdInput,
  type        : S.tag(Discord.MessageComponentTypes.CONTAINER),
  components  : S.Array(S.Union(ButtonRowInput, SelectRowInput, TextDisplayInput, SectionInput, MediaGalleryInput, FileInput, SeparatorInput)),
  accent_color: S.optional(S.Number),
  spoiler     : S.optional(S.Boolean),
});
export type ContainerOutput = typeof ContainerOutput.Type;
export const ContainerOutput = S.Struct({
  id          : Int32IdOutput,
  type        : S.tag(Discord.MessageComponentTypes.CONTAINER),
  components  : S.Array(S.Union(ButtonRowOutput, SelectRowOutput, TextDisplayOutput, SectionOutput, MediaGalleryOutput, FileOutput, SeparatorOutput)),
  accent_color: S.optional(HexColor),
  spoiler     : S.optional(S.Boolean),
});

export type MessageV2Input = typeof MessageV2Input.Type;
export const MessageV2Input = S.Struct({
  flags     : S.tag(Discord.MessageFlags.IsComponentsV2),
  components: S.Array(S.Union(ButtonRowInput, SelectRowInput, TextDisplayInput, SectionInput, MediaGalleryInput, FileInput, SeparatorInput, ContainerInput)),
});
export type MessageV2Output = typeof MessageV2Output.Type;
export const MessageV2Output = S.Struct({
  flags     : S.tag(Discord.MessageFlags.IsComponentsV2),
  components: S.Array(S.Union(ButtonRowOutput, SelectRowOutput, TextDisplayOutput, SectionOutput, MediaGalleryOutput, FileOutput, SeparatorOutput, ContainerOutput)),
});

export type EphemeralV2Input = typeof EphemeralV2Input.Type;
export const EphemeralV2Input = S.Struct({
  ...MessageV2Input.fields,
  flags: S.tag(Discord.MessageFlags.Ephemeral | Discord.MessageFlags.IsComponentsV2),
});
export type EphemeralV2Output = typeof EphemeralV2Output.Type;
export const EphemeralV2Output = S.Struct({
  ...MessageV2Output.fields,
  flags: S.tag(Discord.MessageFlags.Ephemeral | Discord.MessageFlags.IsComponentsV2),
});

export type EmbedAuthorInput = typeof EmbedAuthorInput.Type;
export const EmbedAuthorInput = S.Struct({
  name: S.String,
});

export type EmbedAuthorOutput = typeof EmbedAuthorOutput.Type;
export const EmbedAuthorOutput = S.Struct({
  name: S.String.pipe(S.maxLength(256)),
});

export type EmbedFieldInput = typeof EmbedFieldInput.Type;
export const EmbedFieldInput = S.Struct({
  name  : S.String,
  value : S.String,
  inline: S.optional(S.Boolean),
});

export type EmbedFieldOutput = typeof EmbedFieldOutput.Type;
export const EmbedFieldOutput = S.Struct({
  name  : Str256,
  value : Str1024,
  inline: S.optional(S.Boolean),
});

export type EmbedFooterInput = typeof EmbedFooterInput.Type;
export const EmbedFooterInput = S.Struct({
  text: S.String,
});

export type EmbedFooterOutput = typeof EmbedFooterOutput.Type;
export const EmbedFooterOutput = S.Struct({
  text: Str2048,
});

export type EmbedImageInput = typeof EmbedImageInput.Type;
export const EmbedImageInput = S.Struct({
  url: S.String,
});

export type EmbedImageOutput = typeof EmbedImageOutput.Type;
export const EmbedImageOutput = S.Struct({
  url: S.String,
});

export type EmbedInput = typeof EmbedInput.Type;
export const EmbedInput = S.Struct({
  color      : S.optional(S.Number),
  image      : S.optional(EmbedImageInput),
  author     : S.optional(EmbedAuthorInput),
  title      : S.optional(S.String),
  description: S.optional(S.String),
  fields     : S.optional(S.Array(EmbedFieldInput)),
  footer     : S.optional(EmbedFooterInput),
});

export type EmbedOutput = typeof EmbedOutput.Type;
export const EmbedOutput = S.Struct({
  color      : S.optional(HexColor),
  image      : S.optional(EmbedImageOutput),
  author     : S.optional(EmbedAuthorOutput),
  title      : S.optional(Str256),
  description: S.optional(Str4096),
  fields     : S.optional(S.Array(EmbedFieldOutput).pipe(S.maxItems(25))),
  footer     : S.optional(EmbedFooterOutput),
});

export type MessageV1Input = typeof MessageV1Input.Type;
export const MessageV1Input = S.Struct({
  content   : S.optional(S.String),
  embeds    : S.optional(S.Array(EmbedInput)),
  components: S.optional(S.Array(S.Union(ButtonRowInput, SelectRowInput))),
});
export type MessageV1Output = typeof MessageV1Output.Type;
export const MessageV1Output = S.Struct({
  content   : S.optional(Str2000),
  embeds    : S.optional(S.Array(EmbedInput).pipe(S.maxItems(10))),
  components: S.optional(S.Array(S.Union(ButtonRowOutput, SelectRowOutput)).pipe(S.maxItems(5))),
});

export type EphemeralV1Input = typeof EphemeralV1Input.Type;
export const EphemeralV1Input = S.Struct({
  ...MessageV1Input.fields,
  flags: S.tag(Discord.MessageFlags.Ephemeral),
});
export type EphemeralV1Output = typeof EphemeralV1Output.Type;
export const EphemeralV1Output = S.Struct({
  ...MessageV1Output.fields,
  flags: S.tag(Discord.MessageFlags.Ephemeral),
});

export type TextInputData = typeof TextInputData.Type;
export const TextInputData = S.Struct({
  id       : Int32IdInput,
  type     : S.tag(Discord.MessageComponentTypes.TEXT_INPUT),
  custom_id: CustomIdInput,
  value    : S.String,
});
export type TextInputShortOutput = typeof TextInputShortOutput.Type;
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
export type TextInputParagraphOutput = typeof TextInputParagraphOutput.Type;
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
export type TextInputOutput = typeof TextInputOutput.Type;
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

export type ModalRowData = typeof ModalRowData.Type;
export const ModalRowData = S.Struct({
  id        : Int32IdInput,
  type      : S.tag(Discord.MessageComponentTypes.ACTION_ROW),
  components: S.Array(TextInputData),
});
export type ModalRowOutput = typeof ModalRowOutput.Type;
export const ModalRowOutput = S.Struct({
  id        : Int32IdOutput,
  type      : S.tag(Discord.MessageComponentTypes.ACTION_ROW),
  components: S.Array(S.Union(TextInputShortOutput, TextInputParagraphOutput)).pipe(S.itemsCount(1)),
});

export type ModalData = typeof ModalData.Type;
export const ModalData = S.Struct({
  custom_id : CustomIdInput,
  components: S.Array(ModalRowData),
});
export type ModalOutput = typeof ModalOutput.Type;
export const ModalOutput = S.Struct({
  custom_id : CustomIdOutput,
  title     : Str45,
  components: S.Array(ModalRowOutput).pipe(S.minItems(1), S.maxItems(5)),
});

export const
  Indent     = '  ',
  bold       = (s: string) => `**${s}**`,
  boldL      = (s: string) => `**${s}`,
  boldR      = (s: string) => `${s}**`,
  italic     = (s: string) => `*${s}*`,
  italicL    = (s: string) => `*${s}`,
  italicR    = (s: string) => `${s}*`,
  underline  = (s: string) => `__${s}__`,
  underlineL = (s: string) => `__${s}`,
  underlineR = (s: string) => `${s}__`,
  strike     = (s: string) => `~~${s}~~`,
  strikeL    = (s: string) => `~~${s}`,
  strikeR    = (s: string) => `${s}~~`,
  spoiler    = (s: string) => `||${s}||`,
  spoilerL   = (s: string) => `||${s}`,
  spoilerR   = (s: string) => `${s}||`,
  code       = (s: string) => `\`${s}\``,
  codeL      = (s: string) => `\`${s}`,
  codeR      = (s: string) => `${s}\``,
  block      = (s: string) => `\`\`\`${s}\`\`\``,
  blockL     = (s: string) => `\`\`\`${s}`,
  blockR     = (s: string) => `${s}\`\`\``,
  maskL      = (s: string) => `[${s}`,
  maskR      = (s: string) => `${s}]`,
  linkL      = (s: string) => `(${s}`,
  linkR      = (s: string) => `${s})`,
  hideL      = (s: string) => `<${s}`,
  hideR      = (s: string) => `${s}>`,
  newline    = (s: string) => `\n${s}`,
  newlineR   = (s: string) => `${s}\n`,
  indent     = (l: number) => (s: string) => `${Indent.repeat(l)}${s}`,
  indent2    = (s: string, l: number) => indent(l)(s),
  h1         = (s: string) => `# ${s}`,
  h2         = (s: string) => `## ${s}`,
  h3         = (s: string) => `### ${s}`,
  sh         = (s: string) => `-# ${s}`,
  quote      = (s: string) => `> ${s}`,
  quotes     = (s: string) => `>> ${s}`,
  uli        = (s: string) => `- ${s}`,
  oli        = (s: string) => `1. ${s}`;

export type InteractionInput =
  | ComponentInteractionInput
  | ModalSubmitInteractionInput;

export type ComponentInteractionInput = Discord.APIMessageComponentInteraction;
export type ModalSubmitInteractionInput = Discord.APIModalSubmitInteraction;

export type Interactable = | MessageV1Output
                           | MessageV2Output
                           | ModalOutput;

import * as Spec from '#disreact/codec/JsxSpec.ts';
import {decode, encode} from '@msgpack/msgpack';
import {URL} from 'node:url';
import {deflate, inflate} from 'pako';

const RehydrantId = S.TemplateLiteralParser(
  ...Spec.ControlledId.params,
  '/', S.String,
);

export const isRehydrantFragment = S.is(RehydrantId);

const flattenComponents = (components?: any[]): Discord.AllComponents[] =>
  components?.flatMap((c) => {
    if (c.accessory) {
      return [c, c.accessory, ...c.components];
    }
    if (c.components) {
      return [c, ...flattenComponents(c.components)];
    }
    return [c];
  })
  ?? [];

const unsafeParseComponents = (components: Discord.AllComponents[]) =>
  components.map((c) => {
    if (
      'custom_id' in c &&
      isRehydrantFragment(c.custom_id)
    ) {
      const [i, f] = c.custom_id.split('/');
      (c.custom_id as any) = i;
      return f;
    }
    return '';
  }).join();

const unsafeMergeComponents = (components: Discord.AllComponents[], hydrator: string) =>
  components.reduce((h, c) => {
    if (
      'custom_id' in c &&
      Spec.isControlledId(c.custom_id) &&
      c.custom_id.length < 99
    ) {
      const a = 99 - c.custom_id.length;
      const f = h.substring(0, a);
      (c.custom_id as any) = `${c.custom_id}/${f}`;
      return h.substring(a);
    }
    return h;
  }, hydrator);

const unsafeParseEmbeds = (embeds?: Discord.RichEmbed[]) =>
  embeds?.map((e) => {
    if (!e.image?.url) {
      return '';
    }
    const url = new URL(e.image.url);

    if (url.pathname.startsWith('/_')) {
      const fragment = url.pathname.substring(1);
      url.pathname = '';
      (e.image.url as any) = url.href;
      return fragment;
    }
    return '';
  }).join()
  ?? '';

const unsafeMergeEmbeds = (embeds: Discord.RichEmbed[], hydrator: string) =>
  embeds.reduce((h, e) => {
    if (
      e.image?.url &&
      isRehydrantFragment(e.image.url)
    ) {
      const fragment = e.image.url.substring(e.image.url.indexOf('/') + 1);
      (e.image.url as any) = fragment;
      return h.replace(fragment, '');
    }
    return h;
  }, hydrator);

const unsafeUnpack = (str: string) => {
    const buff = Buffer.from(str, 'base64url');
    const pako = inflate(buff);
    return decode(pako) as any;
};

const unsafePack = (obj: any) => {
    const pack = encode(obj);
    const pako = deflate(pack);
    return Buffer.from(pako).toString('base64url');
};

export const parseInteraction = (ix: InteractionInput) => {
  const components = flattenComponents(ix.message?.components);
  const hydrator = unsafeParseComponents(components) +
                   unsafeParseEmbeds(ix.message?.embeds);

  return {
    components: components,
    hydrator  : unsafeUnpack(hydrator),
  };
};

export const mergeInteractable = (ix: Interactable, params: any) => {
  const hydrator = unsafePack(params);

  if ('custom_id' in ix) {
    return ix;
  }
  if ('embeds' in ix) {
    if (ix.components) {
      const remaining = unsafeMergeEmbeds(
        ix.embeds as any,
        unsafeMergeComponents(ix.components as any, hydrator),
      );
      if (remaining.length) {
        throw new Error();
      }
      return ix;
    }
    else {
      const remaining = unsafeMergeEmbeds(ix.embeds as any, hydrator);
      if (remaining.length) {
        throw new Error();
      }
      return ix;
    }
  }
  if (!ix.components) {
    throw new Error();
  }
};

const Type = Discord.MessageComponentTypes;
