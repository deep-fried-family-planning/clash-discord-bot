import {EmbedController} from '#discord/entities/exv.ts';
import {Button, Row} from '#discord/entities/vc.ts';
import {makeView} from '#discord/entities/view.ts';
import {openView} from '#discord/hooks/use-view.ts';
import {StyleB} from '#pure/dfx';
import {OmniClans} from '#src/discord/omni-board/clans/omni-clans.ts';
import {OmniDeepFryer} from '#src/discord/omni-board/deepfryer/omni-deep-fryer.ts';
import {OmniInfo} from '#src/discord/omni-board/info/omni-info.ts';
import {OmniLink} from '#src/discord/omni-board/link/omni-link.ts';
import {Nav} from '#src/discord/omni-board/nav.ts';
import {OmniRosters} from '#src/discord/omni-board/rosters/omni-rosters.ts';
import {MD} from '#src/internal/pure/pure.ts';


export const OmniBoard = makeView('OmniBoard', () => {
  return [
    EmbedController({
      title      : 'Omni Board',
      description: MD.content(
        'Start',
      ),
    }),
    Row(
      Button({
        label  : 'Info',
        onClick: () => {
          openView(OmniInfo.name);
        },
      }),
      Button({
        label  : 'Clans',
        onClick: () => {
          openView(OmniClans.name);
        },
      }),
      Button({
        label  : 'Rosters',
        onClick: () => {
          openView(OmniRosters.name);
        },
      }),
      Button({
        label  : 'DeepFryer',
        onClick: () => {
          openView(OmniDeepFryer.name);
        },
      }),
    ),
    Row(
      Button({
        label  : 'Link',
        style  : StyleB.SUCCESS,
        onClick: () => {
          openView(OmniLink.name);
        },
      }),
    ),
    Nav({}),
  ];
});
