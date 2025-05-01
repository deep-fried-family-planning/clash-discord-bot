import {Config} from 'effect';

export const DiscordPublicKeyConfig = Config.string('DFFP_DISCORD_PUBLIC_KEY');

export const LambdasConfig = Config.all({
  ix_slash: Config.string('LAMBDA_ARN_IX_SLASH'),
  ix_menu : Config.string('LAMBDA_ARN_IX_MENU'),
  poll    : Config.string('LAMBDA_ARN_IX_SLASH'),
  task    : Config.string('LAMBDA_ARN_IX_SLASH'),
});
