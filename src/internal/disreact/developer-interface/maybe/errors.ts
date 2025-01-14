import {D} from '#pure/effect';
import {COLOR, nColor} from '#src/constants/colors.ts';
import {RK_CLOSE} from '#src/constants/route-kind.ts';
import {dLinesS} from '#src/discord/util/markdown.ts';
import {IXCBS, IXCT, type IxD} from '#src/internal/discord.ts';
import {ComponentPath} from '#src/internal/disreact/entity/routing/component-path.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import {UI} from 'dfx/index';


export type UserMessage = {
  title     : str;
  message   : str;
  retryable?: boolean;
};


export type DeveloperMessage = {
  title  : str;
  message: str;
};


export class ClashError extends D.TaggedError('ClashError')<{
  user     : UserMessage;
  dev      : DeveloperMessage;
  message  : str;
  original?: Error;
  ix?      : IxD;
}> {}


export class DatabaseError extends D.TaggedError('DatabaseError')<{
  user     : UserMessage;
  dev      : DeveloperMessage;
  message  : str;
  original?: Error;
  ix?      : IxD;
}> {}


export class DeveloperError extends D.TaggedError('DeveloperError')<{
  user?    : UserMessage;
  dev?     : DeveloperMessage;
  message? : str;
  original?: Error;
  data?    : unknown;
  ix?      : IxD;
}> {}


export class DiscordError extends D.TaggedError('DiscordError')<{
  user?    : UserMessage;
  dev?     : DeveloperMessage;
  message? : str;
  original?: Error;
  ix?      : IxD;
}> {}


export class RenderError extends D.TaggedError('RenderError')<{
  user?    : UserMessage;
  dev?     : DeveloperMessage;
  original?: Error;
  ix?      : IxD;
}> {}


export class StateError extends D.TaggedError('StateError')<{
  user?    : UserMessage;
  dev?     : DeveloperMessage;
  message? : str;
  original?: Error;
  ix?      : IxD;
}> {}


export class UserError extends D.TaggedError('UserError')<{
  user     : UserMessage;
  dev      : DeveloperMessage;
  message  : str;
  original?: Error;
  ix?      : IxD;
}> {}


export const messageUnrecoverable = {
  embeds: [{
    author: {
      name: 'Unrecoverable Error',
    },
    color      : nColor(COLOR.ERROR),
    title      : 'Unknown Error',
    description: dLinesS(
      `If you don't think your input caused this error, send this link to the support server:`,
      // `-# <https://discord.com/channels/1283847240061947964/${log.channel_id}/${log.id}>`,
    ),
    footer: {
      text: 'Made with ❤️ by NotStr8DontH8 and DFFP.',
    },
  }],
  components: UI.grid([
    [
      {
        type : IXCT.BUTTON,
        style: IXCBS.LINK,
        label: 'Support Server',
        url  : 'https://discord.gg/KfpCtU2rwY',
      },
    ],
    [
      {
        type     : IXCT.BUTTON,
        style    : IXCBS.SUCCESS,
        label    : 'Restart',
        custom_id: ComponentPath.build(ComponentPath.empty()),
      },
      {
        type     : IXCT.BUTTON,
        style    : IXCBS.SECONDARY,
        custom_id: `/k/${RK_CLOSE}/t/T`,
        label    : 'Close',
      },
    ],
  ]),
};
