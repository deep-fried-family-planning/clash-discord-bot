import {Button, ButtonRow, DangerButton, SuccessButton} from '#discord/entities/component-view.ts';
import {TitleEmbed} from '#discord/entities/embed-view.ts';
import {makeEntry} from '#discord/entities/node-view.ts';
import {openView} from '#discord/hooks/use-view.ts';
import {OmniClans} from '#src/discord/omni-board/clans/omni-clans.ts';
import {OmniDeepFryer} from '#src/discord/omni-board/deepfryer/omni-deep-fryer.ts';
import {OmniInfo} from '#src/discord/omni-board/info/omni-info.ts';
import {OmniLink} from '#src/discord/omni-board/link/omni-link.ts';
import {NavButtons} from '#src/discord/omni-board/nav-buttons.ts';
import {OmniRosters} from '#src/discord/omni-board/rosters/omni-rosters.ts';
import {OmniServerConfig} from '#src/discord/omni-board/server-config/omni-server-config.ts';
import {MD} from '#src/internal/pure/pure.ts';


export const OmniStart = makeEntry('OmniBoard', () => {
  return [
    TitleEmbed({
      title      : 'Omni Board',
      description: MD.content(
        'Start',
      ),
    }),
    ButtonRow(
      Button({
        label  : 'Info',
        onClick: () => {
          openView(OmniInfo);
        },
      }),
      Button({
        label  : 'Clans',
        onClick: () => {
          openView(OmniClans);
        },
      }),
      Button({
        label  : 'Rosters',
        onClick: () => {
          openView(OmniRosters);
        },
      }),
      Button({
        label  : 'DeepFryer',
        onClick: () => {
          openView(OmniDeepFryer);
        },
      }),
    ),
    NavButtons({
      first: SuccessButton({
        label  : 'Link',
        onClick: () => {
          openView(OmniLink);
        },
      }),
      second: DangerButton({
        auth   : [],
        label  : 'Server',
        onClick: () => {
          openView(OmniServerConfig);
        },
      }),
    }),
  ];
});
