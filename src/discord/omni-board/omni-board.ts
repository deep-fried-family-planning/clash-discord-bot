import {Cv, Ev} from '#discord/entities/basic';
import {makeEntry} from '#discord/entities/basic/node-view.ts';
import {openView} from '#discord/entities/hooks/use-view.ts';
import {StyleB} from '#pure/dfx';
import {OmniClans} from '#src/discord/omni-board/clans/omni-clans.ts';
import {OmniDeepFryer} from '#src/discord/omni-board/deepfryer/omni-deep-fryer.ts';
import {OmniInfo} from '#src/discord/omni-board/info/omni-info.ts';
import {OmniLink} from '#src/discord/omni-board/link/omni-link.ts';
import {NavButtons} from '#src/discord/omni-board/nav-buttons.ts';
import {OmniRosters} from '#src/discord/omni-board/rosters/omni-rosters.ts';
import {MD} from '#src/internal/pure/pure.ts';


export const OmniBoard = makeEntry('OmniBoard', () => {
  return [
    Ev.Controller({
      title      : 'Omni Board',
      description: MD.content(
        'Start',
      ),
    }),
    Cv.Row(
      Cv.Button({
        label  : 'Info',
        onClick: () => {
          openView(OmniInfo);
        },
      }),
      Cv.Button({
        label  : 'Clans',
        onClick: () => {
          openView(OmniClans);
        },
      }),
      Cv.Button({
        label  : 'Rosters',
        onClick: () => {
          openView(OmniRosters);
        },
      }),
      Cv.Button({
        label  : 'DeepFryer',
        onClick: () => {
          openView(OmniDeepFryer);
        },
      }),
    ),
    Cv.Row(
      Cv.Button({
        label  : 'Link',
        style  : StyleB.SUCCESS,
        onClick: () => {
          openView(OmniLink);
        },
      }),
    ),
    NavButtons({}),
  ];
});
