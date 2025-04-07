import {Boolean, Int, maxLength, optional, String, Struct} from 'effect/Schema';



export const SnowFlake          = String;
export const CustomId           = String.pipe(maxLength(100));
export const InteractionId      = SnowFlake;
export const UserDiscordTag     = String;
export const UserDisplayName    = String;
export const UserName           = String;
export const AvatarHash         = String;
export const OfficialSystemUser = Boolean;
export const OAuth2BotUser      = Boolean;
export const BannerHash         = String;
export const LocaleOption       = String;
export const EmailVerified      = Boolean;
export const EmailAddress       = String;
export const AssetHash          = String;
export const MessageId          = SnowFlake;
export const ChannelId          = SnowFlake;
export const GuildId            = SnowFlake;
export const UserId             = SnowFlake;
export const RoleId             = SnowFlake;
export const MFAEnabled         = Boolean;
export const SkuId              = String;
export const ChannelType        = Int;
export const MarkdownString     = String;
export const VisiblePlainText   = String;

export const EmojiObject = Struct({
  id      : optional(SnowFlake),
  name    : optional(String),
  animated: optional(Boolean),
});
