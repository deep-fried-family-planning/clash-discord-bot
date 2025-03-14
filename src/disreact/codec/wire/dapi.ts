import {CallbackType} from '#src/disreact/codec/enum/index.ts';
import {AssetHash, AvatarHash, BannerHash, EmailAddress, EmailVerified, InteractionId, LocaleOption, MFAEnabled, OAuth2BotUser, SnowFlake, OfficialSystemUser, UserDiscordTag, UserDisplayName, UserId, UserName, MessageId, VisiblePlainText, MarkdownString, CustomId, SkuId, RoleId, ChannelId, EmojiObject} from '#src/disreact/codec/wire/resource/common.ts';
import {RedactionTerminus} from '#src/disreact/codec/wire/shared/shared.ts';
import {PremiumType} from 'dfx/types';
import {Any, Array, Boolean, Enums, greaterThan, Int, Literal, maxItems, maxLength, minItems, optional, Record, String, Struct, Union} from 'effect/Schema';



export const InteractionMetadataUser = Struct({
  id                    : UserId,
  username              : UserName,
  discriminator         : optional(UserDiscordTag),
  global_name           : optional(UserDisplayName),
  avatar                : optional(AvatarHash),
  bot                   : optional(OAuth2BotUser),
  system                : optional(OfficialSystemUser),
  mfa_enabled           : optional(MFAEnabled),
  banner                : optional(BannerHash),
  accent_color          : optional(Int),
  locale                : optional(LocaleOption),
  verified              : optional(EmailVerified),
  email                 : optional(EmailAddress),
  flags                 : optional(Int),
  premium_type          : optional(Enums(PremiumType)),
  public_flags          : optional(Int),
  avatar_decoration_data: optional(Struct({
    asset : AssetHash,
    sku_id: SnowFlake,
  })),
});

export const CommandInteractionMetadata = Struct({
  id                            : InteractionId,
  type                          : Literal(2),
  user                          : InteractionMetadataUser,
  authorizing_integration_owners: Any,
  original_response_message_id  : optional(SnowFlake),
  target_user                   : Any,
  target_message_id             : SnowFlake,
});

export const MessageComponentInteractionMetadata = Struct({
  id                            : InteractionId,
  type                          : Literal(3),
  user                          : InteractionMetadataUser,
  authorizing_integration_owners: Any,
  original_response_message_id  : optional(SnowFlake),
  interacted_message_id         : SnowFlake,
});

export const ModalInteractionMetadataFromComponent = Struct({
  id                             : InteractionId,
  type                           : Literal(5),
  user                           : InteractionMetadataUser,
  authorizing_integration_owners : Any,
  original_response_message_id   : optional(MessageId),
  triggering_interaction_metadata: Union(
    MessageComponentInteractionMetadata,
  ),
});

export const ModalInteractionMetadataFromCommand = Struct({
  id                             : InteractionId,
  type                           : Literal(5),
  user                           : InteractionMetadataUser,
  authorizing_integration_owners : Any,
  original_response_message_id   : optional(MessageId),
  triggering_interaction_metadata: Union(
    CommandInteractionMetadata,
  ),
});

export const InteractionMetadata = Union(
  CommandInteractionMetadata,
  MessageComponentInteractionMetadata,
  ModalInteractionMetadataFromComponent,
  ModalInteractionMetadataFromCommand,
);



export const EmbedAuthor = Struct({
  name: VisiblePlainText.pipe(maxLength(256)),
});

export const EmbedField = Struct({
  name  : VisiblePlainText.pipe(maxLength(256)),
  value : MarkdownString.pipe(maxLength(1024)),
  inline: optional(Boolean),
});

export const EmbedFooter = Struct({
  text: VisiblePlainText.pipe(maxLength(2048)),
});

export const EmbedImage = Struct({
  url: optional(String),
});

export const Embed = Struct({
  author     : optional(EmbedAuthor),
  title      : optional(VisiblePlainText.pipe(maxLength(256))),
  description: optional(MarkdownString.pipe(maxLength(4096))),
  image      : optional(EmbedImage),
  fields     : optional(Array(EmbedField).pipe(maxItems(25))),
  footer     : optional(EmbedFooter),
  color      : optional(Int),
});



export const Button = Struct({
  type     : Literal(2),
  style    : Literal(1, 2, 3, 4, 5, 6),
  custom_id: CustomId,
  label    : optional(VisiblePlainText.pipe(maxLength(80))),
  disabled : optional(Boolean),
  sku_id   : optional(SkuId),
  url      : optional(String),
  emoji    : optional(EmojiObject),
});

export const ButtonRow = Struct({
  type      : Literal(1),
  components: Array(Button).pipe(minItems(1), maxItems(5)),
});

export const SelectOption = Struct({
  label      : VisiblePlainText.pipe(maxLength(100)),
  value      : CustomId,
  description: optional(VisiblePlainText.pipe(maxLength(100))),
  emoji      : optional(EmojiObject),
  default    : optional(Boolean),
});

export const StringSelect = Struct({
  type       : Literal(3),
  custom_id  : CustomId,
  placeholder: optional(String.pipe(maxLength(150))),
  min_values : optional(Int.pipe(greaterThan(0))),
  max_values : optional(Int.pipe(greaterThan(1))),
  options    : Array(SelectOption).pipe(minItems(1), maxItems(25)),
});

export const SelectUserValue = Struct({
  type: Literal('user'),
  id  : UserId,
});

export const UserSelect = Struct({
  type          : Literal(5),
  custom_id     : CustomId,
  placeholder   : optional(String.pipe(maxLength(150))),
  min_values    : optional(Int.pipe(greaterThan(0))),
  max_values    : optional(Int.pipe(greaterThan(1))),
  default_values: optional(Array(SelectUserValue).pipe(minItems(1), maxItems(25))),
});

export const SelectRoleValue = Struct({
  type: Literal('role'),
  id  : RoleId,
});

export const RoleSelect = Struct({
  type          : Literal(6),
  custom_id     : CustomId,
  placeholder   : optional(String.pipe(maxLength(150))),
  min_values    : optional(Int.pipe(greaterThan(0))),
  max_values    : optional(Int.pipe(greaterThan(1))),
  default_values: optional(Array(SelectRoleValue).pipe(minItems(1), maxItems(25))),
});

export const SelectChannelValue = Struct({
  type: Literal('channel'),
  id  : ChannelId,
});

export const ChannelSelect = Struct({
  type          : Literal(8),
  custom_id     : CustomId,
  placeholder   : optional(String.pipe(maxLength(150))),
  min_values    : optional(Int.pipe(greaterThan(0))),
  max_values    : optional(Int.pipe(greaterThan(1))),
  channel_types : optional(Array(Int)),
  default_values: optional(Array(SelectChannelValue).pipe(minItems(1), maxItems(25))),
});

export const SelectValue = Union(
  SelectUserValue,
  SelectRoleValue,
  SelectChannelValue,
);

export const MentionSelect = Struct({
  type          : Literal(7),
  custom_id     : CustomId,
  placeholder   : optional(String.pipe(maxLength(150))),
  min_values    : optional(Int.pipe(greaterThan(0))),
  max_values    : optional(Int.pipe(greaterThan(1))),
  default_values: optional(Array(SelectValue).pipe(minItems(1), maxItems(25))),
});

export const SelectComponent = Union(
  StringSelect,
  UserSelect,
  RoleSelect,
  ChannelSelect,
  MentionSelect,
);

export const SelectRow = Struct({
  type      : Literal(1),
  components: Array(SelectComponent).pipe(minItems(1), maxItems(1)),
});

export const MessageRow = Union(
  ButtonRow,
  SelectRow,
);

export const BaseMessage = Struct({
  content   : optional(String.pipe(maxLength(2000))),
  embeds    : optional(Array(Embed).pipe(maxItems(10))),
  components: optional(Array(MessageRow).pipe(minItems(1), maxItems(5))),
  flags     : optional(Int),
});

export const CommandMessage = Struct({
  ...BaseMessage.fields,
  interaction_metadata: CommandInteractionMetadata,
});

export const MessageComponentMessage = Struct({
  ...BaseMessage.fields,
  interaction_metadata: MessageComponentInteractionMetadata,
});

export const ModalSubmitComponentMessage = Struct({
  ...BaseMessage.fields,
  interaction_metadata: ModalInteractionMetadataFromComponent,
});

export const ModalSubmitCommandMessage = Struct({
  ...BaseMessage.fields,
  interaction_metadata: ModalInteractionMetadataFromCommand,
});

export const IngressMessage = Union(
  CommandMessage,
  MessageComponentMessage,
  ModalSubmitCommandMessage,
  ModalSubmitComponentMessage,
);

export const ButtonData = Struct({
  custom_id     : CustomId,
  component_type: Literal(2),
});

export const StringSelectData = Struct({
  custom_id     : CustomId,
  component_type: Literal(3),
  values        : Array(String.pipe(maxLength(100))).pipe(minItems(1), maxItems(25)),
});

export const UserSelectData = Struct({
  custom_id     : CustomId,
  component_type: Literal(5),
  values        : Array(UserId).pipe(minItems(1), maxItems(25)),
  resolved      : Struct({
    users  : Record({key: UserId, value: Any}),
    members: optional(Record({key: UserId, value: Any})),
  }),
});

export const RoleSelectData = Struct({
  custom_id     : CustomId,
  component_type: Literal(6),
  values        : Array(RoleId).pipe(minItems(1), maxItems(25)),
  resolved      : Struct({
    roles: Record({key: RoleId, value: Any}),
  }),
});

export const ChannelSelectData = Struct({
  custom_id     : CustomId,
  component_type: Literal(8),
  values        : Array(ChannelId).pipe(minItems(1), maxItems(25)),
  resolved      : Struct({
    channels: Record({key: ChannelId, value: Any}),
  }),
});

export const MentionSelectData = Struct({
  custom_id     : CustomId,
  component_type: Literal(7),
  values        : Array(SnowFlake).pipe(minItems(1), maxItems(25)),
  resolved      : Struct({
    channels: Record({key: ChannelId, value: Any}),
    roles   : Record({key: RoleId, value: Any}),
    users   : Record({key: UserId, value: Any}),
    members : optional(Record({key: UserId, value: Any})),
  }),
});

export const ComponentData = Union(
  ButtonData,
  StringSelectData,
  UserSelectData,
  RoleSelectData,
  ChannelSelectData,
  MentionSelectData,
);



export const TextInputData = Struct({
  type     : Literal(4),
  custom_id: CustomId,
  value    : VisiblePlainText.pipe(maxLength(4000)),
});

export const ModalRowData = Struct({
  type      : Literal(1),
  components: Array(TextInputData).pipe(minItems(1), maxItems(1)),
});

export const ModalData = Struct({
  custom_id : CustomId,
  components: Array(ModalRowData).pipe(minItems(1), maxItems(5)),
});



export const BaseRequest = Struct({
  id            : InteractionId,
  token         : RedactionTerminus,
  application_id: RedactionTerminus,
  user_id       : RedactionTerminus,
  guild_id      : optional(RedactionTerminus),
});

export const ComponentRequest = Struct({
  ...BaseRequest.fields,
  type   : Literal(3),
  data   : ComponentData,
  message: IngressMessage,
});

export const ComponentModalRequest = Struct({
  ...BaseRequest.fields,
  type   : Literal(5),
  data   : ModalData,
  message: ModalSubmitComponentMessage,
});

export const CommandModalRequest = Struct({
  ...BaseRequest.fields,
  type: Literal(5),
  data: ModalData,
});

export const ModalRequest = Struct({
  ...BaseRequest.fields,
  type   : Literal(5),
  data   : ModalData,
  message: optional(BaseMessage),
});

export const InteractionRequest = Union(
  ComponentRequest,
  ModalRequest,
);

export const TextInput = Struct({
  type : Literal(1),
  style: Literal(1, 2),
  label: String,
  value: String,
});

export const ModalRow = Struct({
  type      : Literal(1),
  components: Array(TextInput),
});

export const Modal = Struct({
  custom_id : String,
  title     : String,
  components: Array(ModalRow),
});

export const CallbackModal = Struct({
  type: CallbackType.Modal,
  data: Modal,
});

export const CallbackSpent = Struct({
  type: CallbackType.Spent,
  data: BaseMessage,
});

export const CallbackDefer = Struct({
  type: CallbackType.Defer,
});

export const CreateResponse = Union(
  CallbackModal,
  CallbackSpent,
  CallbackDefer,
);

export const EditResponse = Struct({
  id    : InteractionId,
  app_id: String,
  token : String,
  data  : BaseMessage,
});

export type SnowFlake = typeof SnowFlake.Type;
export type Input = typeof InteractionRequest.Type;
