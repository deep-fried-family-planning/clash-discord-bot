import {AssetHash, AvatarHash, BannerHash, ChannelId, CustomId, EmailAddress, EmailVerified, InteractionId, LocaleOption, MessageId, MFAEnabled, OAuth2BotUser, OfficialSystemUser, RoleId, SnowFlake, UserDiscordTag, UserDisplayName, UserId, UserName, VisiblePlainText} from '#src/disreact/codec/dapi/common.ts';
import {S} from '#src/disreact/utils/re-exports.ts';
import {PremiumType} from 'dfx/types';
import {DAPIMessage} from './dapi-message';

export * as Ix from '#src/disreact/codec/dapi/ix.ts';
export type Ix = never;

const InteractionMetadataUser = S.Struct({
  id                    : UserId,
  username              : UserName,
  discriminator         : S.optional(UserDiscordTag),
  global_name           : S.optional(UserDisplayName),
  avatar                : S.optional(AvatarHash),
  bot                   : S.optional(OAuth2BotUser),
  system                : S.optional(OfficialSystemUser),
  mfa_enabled           : S.optional(MFAEnabled),
  banner                : S.optional(BannerHash),
  accent_color          : S.optional(S.Int),
  locale                : S.optional(LocaleOption),
  verified              : S.optional(EmailVerified),
  email                 : S.optional(EmailAddress),
  flags                 : S.optional(S.Int),
  premium_type          : S.optional(S.Enums(PremiumType)),
  public_flags          : S.optional(S.Int),
  avatar_decoration_data: S.optional(S.Struct({
    asset : AssetHash,
    sku_id: SnowFlake,
  })),
});

export const CommandInteractionMetadata = S.Struct({
  id                            : InteractionId,
  type                          : S.Literal(2),
  user                          : InteractionMetadataUser,
  authorizing_integration_owners: S.Any,
  original_response_message_id  : S.optional(SnowFlake),
  target_user                   : S.Any,
  target_message_id             : SnowFlake,
});

export const MessageComponentInteractionMetadata = S.Struct({
  id                            : InteractionId,
  type                          : S.Literal(3),
  user                          : InteractionMetadataUser,
  authorizing_integration_owners: S.Any,
  original_response_message_id  : S.optional(SnowFlake),
  interacted_message_id         : SnowFlake,
});

export const ModalInteractionMetadataFromComponent = S.Struct({
  id                             : InteractionId,
  type                           : S.Literal(5),
  user                           : InteractionMetadataUser,
  authorizing_integration_owners : S.Any,
  original_response_message_id   : S.optional(MessageId),
  triggering_interaction_metadata: S.Union(
    MessageComponentInteractionMetadata,
  ),
});

export const ModalInteractionMetadataFromCommand = S.Struct({
  id                             : InteractionId,
  type                           : S.Literal(5),
  user                           : InteractionMetadataUser,
  authorizing_integration_owners : S.Any,
  original_response_message_id   : S.optional(MessageId),
  triggering_interaction_metadata: S.Union(
    CommandInteractionMetadata,
  ),
});

export const InteractionMetadata = S.Union(
  CommandInteractionMetadata,
  MessageComponentInteractionMetadata,
  ModalInteractionMetadataFromComponent,
  ModalInteractionMetadataFromCommand,
);

export const ButtonData = S.Struct({
  custom_id     : CustomId,
  component_type: S.Literal(2),
});

export const StringSelectData = S.Struct({
  custom_id     : CustomId,
  component_type: S.Literal(3),
  values        : S.Array(S.String.pipe(S.maxLength(100))).pipe(S.minItems(1), S.maxItems(25)),
});

export const UserSelectData = S.Struct({
  custom_id     : CustomId,
  component_type: S.Literal(5),
  values        : S.Array(UserId).pipe(S.minItems(1), S.maxItems(25)),
  resolved      : S.Struct({
    users  : S.Record({key: UserId, value: S.Any}),
    members: S.optional(S.Record({key: UserId, value: S.Any})),
  }),
});

export const RoleSelectData = S.Struct({
  custom_id     : CustomId,
  component_type: S.Literal(6),
  values        : S.Array(RoleId).pipe(S.minItems(1), S.maxItems(25)),
  resolved      : S.Struct({
    roles: S.Record({key: RoleId, value: S.Any}),
  }),
});

export const ChannelSelectData = S.Struct({
  custom_id     : CustomId,
  component_type: S.Literal(8),
  values        : S.Array(ChannelId).pipe(S.minItems(1), S.maxItems(25)),
  resolved      : S.Struct({
    channels: S.Record({key: ChannelId, value: S.Any}),
  }),
});

export const MentionSelectData = S.Struct({
  custom_id     : CustomId,
  component_type: S.Literal(7),
  values        : S.Array(SnowFlake).pipe(S.minItems(1), S.maxItems(25)),
  resolved      : S.Struct({
    channels: S.Record({key: ChannelId, value: S.Any}),
    roles   : S.Record({key: RoleId, value: S.Any}),
    users   : S.Record({key: UserId, value: S.Any}),
    members : S.optional(S.Record({key: UserId, value: S.Any})),
  }),
});

export const ComponentData = S.Union(
  ButtonData,
  StringSelectData,
  UserSelectData,
  RoleSelectData,
  ChannelSelectData,
  MentionSelectData,
);


export const TextInputData = S.Struct({
  type     : S.Literal(4),
  custom_id: CustomId,
  value    : VisiblePlainText.pipe(S.maxLength(4000)),
});

export const ModalRowData = S.Struct({
  type      : S.Literal(1),
  components: S.Array(TextInputData).pipe(S.minItems(1), S.maxItems(1)),
});

export const ModalData = S.Struct({
  custom_id : CustomId,
  components: S.Array(ModalRowData).pipe(S.minItems(1), S.maxItems(5)),
});

export const BaseBody = S.Struct({
  id            : S.String,
  token         : S.Redacted(S.String),
  application_id: S.String,
  user_id       : S.String,
  guild_id      : S.String,
});

export const ComponentRequestBody = S.Struct({
  ...BaseBody.fields,
  type   : S.Literal(2),
  data   : ComponentData,
  message: DAPIMessage.Base,
});

export const ModalRequestBody = S.Struct({
  ...BaseBody.fields,
  type   : S.Literal(5),
  data   : ModalData,
  message: S.optional(DAPIMessage.Base),
});

export const RequestBody = S.Union(
  ComponentRequestBody,
  ModalRequestBody,
);
export type RequestBody = typeof RequestBody.Type;
