import {Button, Row} from '#discord/entities/cxv.ts';
import {EmbedController} from '#discord/entities/exv.ts';
import {makeView} from '#discord/entities/view.ts';
import {openView} from '#discord/hooks/use-view.ts';
import {OmniClans} from '#src/discord/view-nodes/omni-board/clans/omni-clans.ts';
import {OmniInfo} from '#src/discord/view-nodes/omni-board/info/omni-info.ts';
import {Nav} from '#src/discord/view-nodes/omni-board/nav.ts';
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
    ),
    Nav({}),
  ];
});
