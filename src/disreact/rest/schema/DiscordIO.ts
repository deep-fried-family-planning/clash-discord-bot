import {Discord} from 'dfx';
import * as S from 'effect/Schema';

/**
 * Common
 */
export const Int32IdIn = S.optional(S.Number);

export const Int32IdOut = S.optional(S.Int.pipe(S.between(0, 2147483647)));

export const CustomIdIn = S.String;

export const CustomIdOut = S.String.pipe(S.maxLength(100));

export const EmojiIn = S.Struct({
  id      : S.optional(S.String),
  name    : S.optional(S.String),
  animated: S.optional(S.Boolean),
});

export const EmojiOut = S.Struct({
  id      : S.optional(S.String),
  name    : S.optional(S.String),
  animated: S.optional(S.Boolean),
});

/**
 * @link https://discord.com/developers/docs/components/reference#unfurled-media-item-structure
 */
export const UnfurledMediaItemIn = S.Struct({
  url          : S.String,
  proxy_url    : S.optional(S.String),
  height       : S.optional(S.Number),
  width        : S.optional(S.Number),
  content_type : S.optional(S.String),
  attachment_id: S.optional(S.String),
});

export const UnfurledMediaItemOut = S.Struct({
  url: S.String,
});

/**
 * Button
 */
export const ButtonData = S.Struct({
  component_type: S.tag(Discord.MessageComponentTypes.BUTTON),
  custom_id     : CustomIdIn,
});

export const PrimaryButtonIn = S.Struct({
  id       : Int32IdIn,
  type     : S.tag(Discord.MessageComponentTypes.BUTTON),
  style    : S.tag(Discord.ButtonStyleTypes.PRIMARY),
  custom_id: CustomIdIn,
  emoji    : S.optional(EmojiIn),
  label    : S.optional(S.String),
  disabled : S.optional(S.Boolean),
});
export const PrimaryButtonOut = S.Struct({
  id       : Int32IdOut,
  type     : S.tag(Discord.MessageComponentTypes.BUTTON),
  style    : S.tag(Discord.ButtonStyleTypes.PRIMARY),
  custom_id: CustomIdOut,
  emoji    : S.optional(EmojiOut),
  label    : S.optional(S.String.pipe(S.maxLength(80))),
  disabled : S.optional(S.Boolean),
});

export const SecondaryButtonIn = S.Struct({
  id       : Int32IdIn,
  type     : S.tag(Discord.MessageComponentTypes.BUTTON),
  style    : S.tag(Discord.ButtonStyleTypes.SECONDARY),
  custom_id: CustomIdIn,
  emoji    : S.optional(EmojiIn),
  label    : S.optional(S.String),
  disabled : S.optional(S.Boolean),
});
export const SecondaryButtonOut = S.Struct({
  id       : Int32IdOut,
  type     : S.tag(Discord.MessageComponentTypes.BUTTON),
  style    : S.tag(Discord.ButtonStyleTypes.SECONDARY),
  custom_id: CustomIdOut,
  emoji    : S.optional(EmojiOut),
  label    : S.optional(S.String.pipe(S.maxLength(80))),
  disabled : S.optional(S.Boolean),
});

export const SuccessButtonIn = S.Struct({
  id       : Int32IdIn,
  type     : S.tag(Discord.MessageComponentTypes.BUTTON),
  style    : S.tag(Discord.ButtonStyleTypes.SUCCESS),
  custom_id: CustomIdIn,
  emoji    : S.optional(EmojiIn),
  label    : S.optional(S.String),
  disabled : S.optional(S.Boolean),
});
export const SuccessButtonOut = S.Struct({
  id       : Int32IdOut,
  type     : S.tag(Discord.MessageComponentTypes.BUTTON),
  style    : S.tag(Discord.ButtonStyleTypes.SUCCESS),
  custom_id: CustomIdOut,
  emoji    : S.optional(EmojiOut),
  label    : S.optional(S.String.pipe(S.maxLength(80))),
  disabled : S.optional(S.Boolean),
});

export const DangerButtonIn = S.Struct({
  id       : Int32IdIn,
  type     : S.tag(Discord.MessageComponentTypes.BUTTON),
  style    : S.tag(Discord.ButtonStyleTypes.DANGER),
  custom_id: CustomIdIn,
  emoji    : S.optional(EmojiIn),
  label    : S.optional(S.String),
  disabled : S.optional(S.Boolean),
});
export const DangerButtonOut = S.Struct({
  id       : Int32IdOut,
  type     : S.tag(Discord.MessageComponentTypes.BUTTON),
  style    : S.tag(Discord.ButtonStyleTypes.DANGER),
  custom_id: CustomIdOut,
  emoji    : S.optional(EmojiOut),
  label    : S.optional(S.String.pipe(S.maxLength(80))),
  disabled : S.optional(S.Boolean),
});

export const LinkButtonIn = S.Struct({
  id      : Int32IdIn,
  type    : S.tag(Discord.MessageComponentTypes.BUTTON),
  style   : S.tag(Discord.ButtonStyleTypes.LINK),
  url     : S.String,
  emoji   : S.optional(EmojiIn),
  label   : S.optional(S.String),
  disabled: S.optional(S.Boolean),
});
export const LinkButtonOut = S.Struct({
  id      : Int32IdOut,
  type    : S.tag(Discord.MessageComponentTypes.BUTTON),
  style   : S.tag(Discord.ButtonStyleTypes.LINK),
  url     : S.String.pipe(S.maxLength(512)),
  emoji   : S.optional(EmojiOut),
  label   : S.optional(S.String.pipe(S.maxLength(80))),
  disabled: S.optional(S.Boolean),
});

export const PremiumButtonIn = S.Struct({
  id    : Int32IdIn,
  type  : S.tag(Discord.MessageComponentTypes.BUTTON),
  style : S.tag(Discord.ButtonStyleTypes.PREMIUM),
  sku_id: S.String,
});
export const PremiumButtonOut = S.Struct({
  id   : Int32IdOut,
  type : S.tag(Discord.MessageComponentTypes.BUTTON),
  style: S.tag(Discord.ButtonStyleTypes.PREMIUM),
});

export const ButtonIn = S.Union(PrimaryButtonIn, SecondaryButtonIn, SuccessButtonIn, DangerButtonIn, LinkButtonIn, PremiumButtonIn);
export const ButtonOut = S.Union(PrimaryButtonOut, SecondaryButtonOut, SuccessButtonOut, DangerButtonOut, LinkButtonOut, PremiumButtonOut);

export const ButtonRowIn = S.Struct({
  id        : Int32IdIn,
  type      : S.tag(Discord.MessageComponentTypes.ACTION_ROW),
  components: S.Array(ButtonIn),
});
export const ButtonRowOut = S.Struct({
  id        : Int32IdOut,
  type      : S.tag(Discord.MessageComponentTypes.ACTION_ROW),
  components: S.Array(ButtonOut).pipe(S.minItems(1), S.maxItems(5)),
});

/**
 * Select Menu
 */
export const StringSelectOptionIn = S.Struct({
  value      : S.String,
  label      : S.String,
  description: S.optional(S.String),
  default    : S.optional(S.Boolean),
  emoji      : S.optional(EmojiIn),
});
export const StringSelectOptionOut = S.Struct({
  value      : S.String.pipe(S.maxLength(100)),
  label      : S.String.pipe(S.maxLength(100)),
  description: S.optional(S.String.pipe(S.maxLength(150))),
  default    : S.optional(S.Boolean),
  emoji      : S.optional(EmojiOut),
});

export const StringSelectIn = S.Struct({
  id         : Int32IdIn,
  type       : S.tag(Discord.MessageComponentTypes.STRING_SELECT),
  custom_id  : CustomIdIn,
  placeholder: S.optional(S.String),
  options    : S.Array(StringSelectOptionIn),
});
export const StringSelectData = S.Struct({
  id            : Int32IdOut,
  component_type: S.tag(Discord.MessageComponentTypes.STRING_SELECT),
  custom_id     : CustomIdIn,
  values        : S.Array(S.String),
});
export const StringSelectOut = S.Struct({
  type       : S.tag(Discord.MessageComponentTypes.STRING_SELECT),
  custom_id  : CustomIdOut,
  placeholder: S.optional(S.String.pipe(S.maxLength(150))),
  options    : S.Array(StringSelectOptionOut).pipe(S.minItems(1), S.maxItems(25)),
});

export const ChannelSelectValueIn = S.Struct({
  type: S.tag('channel'),
  id  : S.String,
});
export const ChannelSelectValueOut = S.Struct({
  type: S.tag('channel'),
  id  : S.String,
});

export const ChannelSelectIn = S.Struct({
  id            : Int32IdIn,
  type          : S.tag(Discord.MessageComponentTypes.CHANNEL_SELECT),
  custom_id     : CustomIdIn,
  placeholder   : S.optional(S.String),
  default_values: S.Array(ChannelSelectValueIn),
  channel_types : S.optional(S.Array(S.Number)),
  min_values    : S.optional(S.Number),
  max_values    : S.optional(S.Number),
  disabled      : S.optional(S.Boolean),
});
export const ChannelSelectData = S.Struct({
  component_type: S.tag(Discord.MessageComponentTypes.CHANNEL_SELECT),
  custom_id     : CustomIdIn,
  values        : S.Array(S.String),
});
export const ChannelSelectOut = S.Struct({
  id            : Int32IdOut,
  type          : S.tag(Discord.MessageComponentTypes.CHANNEL_SELECT),
  custom_id     : CustomIdOut,
  placeholder   : S.optional(S.String.pipe(S.maxLength(150))),
  default_values: S.Array(ChannelSelectValueOut).pipe(S.maxItems(25)),
  channel_types : S.optional(S.Array(S.Enums(Discord.ChannelTypes))),
  min_values    : S.optional(S.Int.pipe(S.between(1, 25))),
  max_values    : S.optional(S.Int.pipe(S.between(1, 25))),
  disabled      : S.optional(S.Boolean),
});

export const RoleSelectValueIn = S.Struct({
  type: S.tag('role'),
  id  : S.String,
});
export const RoleSelectValueOut = S.Struct({
  type: S.tag('role'),
  id  : S.String,
});

export const RoleSelectIn = S.Struct({
  id            : Int32IdIn,
  type          : S.tag(Discord.MessageComponentTypes.ROLE_SELECT),
  custom_id     : CustomIdIn,
  placeholder   : S.optional(S.String),
  default_values: S.Array(RoleSelectValueIn),
  min_values    : S.optional(S.Number),
  max_values    : S.optional(S.Number),
  disabled      : S.optional(S.Boolean),
});
export const RoleSelectData = S.Struct({
  component_type: S.tag(Discord.MessageComponentTypes.ROLE_SELECT),
  custom_id     : CustomIdIn,
  values        : S.Array(S.String),
});
export const RoleSelectOut = S.Struct({
  id            : Int32IdOut,
  type          : S.tag(Discord.MessageComponentTypes.ROLE_SELECT),
  custom_id     : CustomIdOut,
  placeholder   : S.optional(S.String.pipe(S.maxLength(150))),
  default_values: S.Array(RoleSelectValueOut).pipe(S.maxItems(25)),
  min_values    : S.optional(S.Int.pipe(S.between(1, 25))),
  max_values    : S.optional(S.Int.pipe(S.between(1, 25))),
  disabled      : S.optional(S.Boolean),
});

export const UserSelectValueIn = S.Struct({
  type: S.tag('user'),
  id  : S.String,
});
export const UserSelectValueOut = S.Struct({
  type: S.tag('user'),
  id  : S.String,
});

export const UserSelectIn = S.Struct({
  id            : Int32IdIn,
  type          : S.tag(Discord.MessageComponentTypes.USER_SELECT),
  custom_id     : CustomIdIn,
  placeholder   : S.optional(S.String),
  default_values: S.Array(UserSelectValueIn),
  min_values    : S.optional(S.Number),
  max_values    : S.optional(S.Number),
  disabled      : S.optional(S.Boolean),
});
export const UserSelectData = S.Struct({
  component_type: S.tag(Discord.MessageComponentTypes.USER_SELECT),
  custom_id     : CustomIdIn,
  values        : S.Array(S.String),
});
export const UserSelectOut = S.Struct({
  id            : Int32IdOut,
  type          : S.tag(Discord.MessageComponentTypes.USER_SELECT),
  custom_id     : CustomIdOut,
  placeholder   : S.optional(S.String.pipe(S.maxLength(150))),
  default_values: S.Array(UserSelectValueOut).pipe(S.maxItems(25)),
  min_values    : S.optional(S.Int.pipe(S.between(1, 25))),
  max_values    : S.optional(S.Int.pipe(S.between(1, 25))),
  disabled      : S.optional(S.Boolean),
});

export const MentionableSelectValueIn = S.Union(ChannelSelectValueIn, RoleSelectValueIn, UserSelectValueIn);
export const MentionableSelectValueOut = S.Union(ChannelSelectValueOut, RoleSelectValueOut, UserSelectValueOut);

export const MentionableSelectIn = S.Struct({
  id            : Int32IdIn,
  type          : S.tag(Discord.MessageComponentTypes.MENTIONABLE_SELECT),
  custom_id     : CustomIdIn,
  placeholder   : S.optional(S.String),
  default_values: S.Array(MentionableSelectValueIn),
  min_values    : S.optional(S.Number),
  max_values    : S.optional(S.Number),
  disabled      : S.optional(S.Boolean),
});
export const MentionableSelectData = S.Struct({
  component_type: S.tag(Discord.MessageComponentTypes.MENTIONABLE_SELECT),
  custom_id     : CustomIdIn,
  values        : S.Array(S.String),
});
export const MentionableSelectOut = S.Struct({
  id            : Int32IdOut,
  type          : S.tag(Discord.MessageComponentTypes.MENTIONABLE_SELECT),
  custom_id     : CustomIdOut,
  placeholder   : S.optional(S.String.pipe(S.maxLength(150))),
  default_values: S.Array(MentionableSelectValueOut).pipe(S.maxItems(25)),
  min_values    : S.optional(S.Int.pipe(S.between(1, 25))),
  max_values    : S.optional(S.Int.pipe(S.between(1, 25))),
  disabled      : S.optional(S.Boolean),
});

export const SelectRowIn = S.Struct({
  id        : Int32IdIn,
  type      : S.tag(Discord.MessageComponentTypes.ACTION_ROW),
  components: S.Array(S.Union(
    StringSelectIn,
    ChannelSelectIn,
    RoleSelectIn,
    UserSelectIn,
    MentionableSelectIn,
  )),
});
export const SelectRowOut = S.Struct({
  id        : Int32IdOut,
  type      : S.tag(Discord.MessageComponentTypes.ACTION_ROW),
  components: S.Array(S.Union(
    StringSelectOut,
    ChannelSelectOut,
    RoleSelectOut,
    UserSelectOut,
    MentionableSelectOut,
  )).pipe(S.itemsCount(1)),
});

/**
 * Message Components v2
 */
export const TextDisplayIn = S.Struct({
  id     : Int32IdIn,
  type   : S.tag(Discord.MessageComponentTypes.TEXT_DISPLAY),
  content: S.String,
});
export const TextDisplayOut = S.Struct({
  id     : Int32IdOut,
  type   : S.tag(Discord.MessageComponentTypes.TEXT_DISPLAY),
  content: S.String.pipe(S.maxLength(1000)),
});

export const ThumbnailIn = S.Struct({
  id         : Int32IdIn,
  type       : S.tag(Discord.MessageComponentTypes.THUMBNAIL),
  media      : UnfurledMediaItemIn,
  description: S.optional(S.String),
  spoiler    : S.optional(S.Boolean),
});
export const ThumbnailOut = S.Struct({
  id         : Int32IdOut,
  type       : S.tag(Discord.MessageComponentTypes.THUMBNAIL),
  media      : UnfurledMediaItemOut,
  description: S.optional(S.String.pipe(S.maxLength(1024))),
  spoiler    : S.optional(S.Boolean),
});

export const SectionIn = S.Struct({
  id        : Int32IdIn,
  type      : S.tag(Discord.MessageComponentTypes.SECTION),
  components: S.Array(TextDisplayIn),
  accessory : S.Union(ButtonIn, ThumbnailIn),
});
export const SectionOut = S.Struct({
  id        : Int32IdOut,
  type      : S.tag(Discord.MessageComponentTypes.SECTION),
  components: S.Array(TextDisplayOut).pipe(S.minItems(1), S.maxItems(3)),
  accessory : S.Union(ButtonOut, ThumbnailOut),
});

export const MediaGalleryItemIn = S.Struct({
  media      : UnfurledMediaItemIn,
  description: S.optional(S.String),
  spoiler    : S.optional(S.Boolean),
});
export const MediaGalleryItemOut = S.Struct({
  media      : UnfurledMediaItemOut,
  description: S.optional(S.String.pipe(S.maxLength(1024))),
  spoiler    : S.optional(S.Boolean),
});

export const MediaGalleryIn = S.Struct({
  id   : Int32IdIn,
  type : S.tag(Discord.MessageComponentTypes.MEDIA_GALLERY),
  media: S.Array(MediaGalleryItemIn),
});
export const MediaGalleryOut = S.Struct({
  id   : Int32IdOut,
  type : S.tag(Discord.MessageComponentTypes.MEDIA_GALLERY),
  media: S.Array(MediaGalleryItemOut).pipe(S.minItems(1), S.maxItems(10)),
});

export const FileIn = S.Struct({
  id     : Int32IdIn,
  type   : S.tag(Discord.MessageComponentTypes.FILE),
  file   : UnfurledMediaItemIn,
  spoiler: S.optional(S.Boolean),
  name   : S.String,
  size   : S.Number,
});
export const FileOut = S.Struct({
  id     : Int32IdOut,
  type   : S.tag(Discord.MessageComponentTypes.FILE),
  file   : UnfurledMediaItemOut,
  spoiler: S.optional(S.Boolean),
});

export const SeparatorIn = S.Struct({
  id     : Int32IdIn,
  type   : S.tag(Discord.MessageComponentTypes.SEPARATOR),
  divider: S.optional(S.Boolean),
  spacing: S.optional(S.Enums(Discord.MessageComponentSeparatorSpacingSize)),
});
export const SeparatorOut = S.Struct({
  id     : Int32IdOut,
  type   : S.tag(Discord.MessageComponentTypes.SEPARATOR),
  divider: S.optional(S.Boolean),
  spacing: S.optional(S.Enums(Discord.MessageComponentSeparatorSpacingSize)),
});

/**
 * wrapping https://discord.com/channels/613425648685547541/1364347506200416307/1366842924230508557
 */
export const ContainerIn = S.Struct({
  id          : Int32IdIn,
  type        : S.tag(Discord.MessageComponentTypes.CONTAINER),
  components  : S.Array(S.Union(ButtonRowIn, SelectRowIn, TextDisplayIn, SectionIn, MediaGalleryIn, FileIn, SeparatorIn)),
  accent_color: S.optional(S.Number),
  spoiler     : S.optional(S.Boolean),
});
export const ContainerOut = S.Struct({
  id          : Int32IdOut,
  type        : S.tag(Discord.MessageComponentTypes.CONTAINER),
  components  : S.Array(S.Union(ButtonRowOut, SelectRowOut, TextDisplayOut, SectionOut, MediaGalleryOut, FileOut, SeparatorOut)),
  accent_color: S.optional(S.Int.pipe(S.between(0, 0xFFFFFF))),
  spoiler     : S.optional(S.Boolean),
});

export const MessageV2In = S.Struct({
  flags     : S.tag(Discord.MessageFlags.IsComponentsV2),
  components: S.Array(S.Union(ButtonRowIn, SelectRowIn, TextDisplayIn, SectionIn, MediaGalleryIn, FileIn, SeparatorIn, ContainerIn)),
});
export const MessageV2Out = S.Struct({
  flags     : S.tag(Discord.MessageFlags.IsComponentsV2),
  components: S.Array(S.Union(ButtonRowOut, SelectRowOut, TextDisplayOut, SectionOut, MediaGalleryOut, FileOut, SeparatorOut, ContainerOut)),
});

export const EphemeralV2In = S.Struct({
  ...MessageV2In.fields,
  flags: S.tag(Discord.MessageFlags.Ephemeral | Discord.MessageFlags.IsComponentsV2),
});
export const EphemeralV2Out = S.Struct({
  ...MessageV2Out.fields,
  flags: S.tag(Discord.MessageFlags.Ephemeral | Discord.MessageFlags.IsComponentsV2),
});

/**
 * Embed
 */
export const EmbedAuthorIn = S.Struct({
  name: S.String,
});
export const EmbedAuthorOut = S.Struct({
  name: S.String.pipe(S.maxLength(256)),
});

export const EmbedFieldIn = S.Struct({
  name  : S.String,
  value : S.String,
  inline: S.optional(S.Boolean),
});
export const EmbedFieldOut = S.Struct({
  name  : S.String.pipe(S.maxLength(256)),
  value : S.String.pipe(S.maxLength(1024)),
  inline: S.optional(S.Boolean),
});

export const EmbedFooterIn = S.Struct({
  text: S.String,
});
export const EmbedFooterOut = S.Struct({
  text: S.String.pipe(S.maxLength(2048)),
});

export const EmbedImageIn = S.Struct({
  url: S.String,
});
export const EmbedImageOut = S.Struct({
  url: S.String,
});

export const EmbedIn = S.Struct({
  color      : S.optional(S.Number),
  image      : S.optional(EmbedImageIn),
  author     : S.optional(EmbedAuthorIn),
  title      : S.optional(S.String),
  description: S.optional(S.String),
  fields     : S.optional(S.Array(EmbedFieldIn)),
  footer     : S.optional(EmbedFooterIn),
});
export const EmbedOut = S.Struct({
  color      : S.optional(S.Int.pipe(S.between(0, 0xFFFFFF))),
  image      : S.optional(EmbedImageOut),
  author     : S.optional(EmbedAuthorOut),
  title      : S.optional(S.String.pipe(S.maxLength(256))),
  description: S.optional(S.String.pipe(S.maxLength(4096))),
  fields     : S.optional(S.Array(EmbedFieldOut).pipe(S.maxItems(25))),
  footer     : S.optional(EmbedFooterOut),
});

/**
 * Message Components V1
 */
export const MessageV1In = S.Struct({
  content   : S.optional(S.String),
  embeds    : S.optional(S.Array(EmbedIn)),
  components: S.optional(S.Array(S.Union(ButtonRowIn, SelectRowIn))),
});
export const MessageV1Out = S.Struct({
  content   : S.optional(S.String.pipe(S.maxLength(2000))),
  embeds    : S.optional(S.Array(EmbedIn).pipe(S.maxItems(10))),
  components: S.optional(S.Array(S.Union(ButtonRowOut, SelectRowOut)).pipe(S.maxItems(5))),
});

export const EphemeralV1In = S.Struct({
  ...MessageV1In.fields,
  flags: S.tag(Discord.MessageFlags.Ephemeral),
});
export const EphemeralV1Out = S.Struct({
  ...MessageV1Out.fields,
  flags: S.tag(Discord.MessageFlags.Ephemeral),
});

/**
 * Modal
 */
export const TextInputData = S.Struct({
  id       : Int32IdIn,
  type     : S.tag(Discord.MessageComponentTypes.TEXT_INPUT),
  custom_id: CustomIdIn,
  value    : S.String,
});
export const TextInputShortOut = S.Struct({
  id         : Int32IdOut,
  type       : S.tag(Discord.MessageComponentTypes.TEXT_INPUT),
  style      : S.tag(Discord.TextInputStyleTypes.SHORT),
  custom_id  : CustomIdOut,
  value      : S.optional(S.String.pipe(S.maxLength(4000))),
  label      : S.optional(S.String.pipe(S.maxLength(45))),
  placeholder: S.optional(S.String.pipe(S.maxLength(100))),
  required   : S.optional(S.Boolean),
  min_length : S.optional(S.Int.pipe(S.positive(), S.between(0, 4000))),
  max_length : S.optional(S.Int.pipe(S.positive(), S.between(1, 4000))),
});
export const TextInputParagraphOut = S.Struct({
  id         : Int32IdOut,
  type       : S.tag(Discord.MessageComponentTypes.TEXT_INPUT),
  style      : S.tag(Discord.TextInputStyleTypes.PARAGRAPH),
  custom_id  : CustomIdOut,
  value      : S.optional(S.String.pipe(S.maxLength(4000))),
  label      : S.optional(S.String.pipe(S.maxLength(45))),
  placeholder: S.optional(S.String.pipe(S.maxLength(100))),
  required   : S.optional(S.Boolean),
  min_length : S.optional(S.Int.pipe(S.positive(), S.between(0, 4000))),
  max_length : S.optional(S.Int.pipe(S.positive(), S.between(1, 4000))),
});
export const TextInputOut = S.Struct({
  id         : Int32IdOut,
  type       : S.tag(Discord.MessageComponentTypes.TEXT_INPUT),
  style      : S.Enums(Discord.TextInputStyleTypes).pipe(S.optionalWith({default: () => Discord.TextInputStyleTypes.SHORT})),
  custom_id  : CustomIdOut,
  value      : S.optional(S.String.pipe(S.maxLength(4000))),
  label      : S.optional(S.String.pipe(S.maxLength(45))),
  placeholder: S.optional(S.String.pipe(S.maxLength(100))),
  required   : S.optional(S.Boolean),
  min_length : S.optional(S.Int.pipe(S.positive(), S.between(0, 4000))),
  max_length : S.optional(S.Int.pipe(S.positive(), S.between(1, 4000))),
});

export const ModalRowData = S.Struct({
  id        : Int32IdIn,
  type      : S.tag(Discord.MessageComponentTypes.ACTION_ROW),
  components: S.Array(TextInputData),
});
export const ModalRowOut = S.Struct({
  id        : Int32IdOut,
  type      : S.tag(Discord.MessageComponentTypes.ACTION_ROW),
  components: S.Array(S.Union(TextInputShortOut, TextInputParagraphOut)).pipe(S.itemsCount(1)),
});

export const ModalData = S.Struct({
  custom_id : CustomIdIn,
  components: S.Array(ModalRowData),
});
export const ModalOut = S.Struct({
  custom_id : CustomIdOut,
  title     : S.String.pipe(S.maxLength(45)),
  components: S.Array(ModalRowOut).pipe(S.minItems(1), S.maxItems(5)),
});
