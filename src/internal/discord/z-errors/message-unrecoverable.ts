import {CxPath} from '#discord/entities/cx-path.ts';
import {COLOR, nColor} from '#src/constants/colors.ts';
import {RK_CLOSE} from '#src/constants/route-kind.ts';
import {dLinesS} from '#src/discord/util/markdown.ts';
import {IXCBS, IXCT} from '#src/internal/discord.ts';
import {UI} from 'dfx';


export const messageUnrecoverable = {
  embeds    : [{
    author     : {
      name: 'Unrecoverable Error',
    },
    color      : nColor(COLOR.ERROR),
    title      : 'Unknown Error',
    description: dLinesS(
      `If you don't think your input caused this error, send this link to the support server:`,
      // `-# <https://discord.com/channels/1283847240061947964/${log.channel_id}/${log.id}>`,
    ),
    footer     : {
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
        custom_id: CxPath.build(CxPath.empty()),
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
