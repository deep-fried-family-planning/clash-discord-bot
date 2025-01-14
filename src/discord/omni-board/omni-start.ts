import {OmniClans} from '#src/discord/omni-board/clans/omni-clans.ts';
import {OmniDeepFryer} from '#src/discord/omni-board/deepfryer/omni-deep-fryer.ts';
import {OmniInfo} from '#src/discord/omni-board/info/omni-info.ts';
import {OmniLink} from '#src/discord/omni-board/link/omni-link.ts';
import {NavButtons} from '#src/discord/omni-board/nav-buttons.ts';
import {OmniRosters} from '#src/discord/omni-board/rosters/omni-rosters.ts';
import {OmniServerConfig} from '#src/discord/omni-board/server-config/omni-server-config.ts';
import {openView} from '#src/internal/disreact/constants/hooks/use-view.ts';
import {_Button, ButtonRow, DangerButton, SuccessButton} from '#src/internal/disreact/entity/interface-component.ts';
import {TitleEmbed} from '#src/internal/disreact/entity/interface-embed.ts';
import {makeEntry} from '#src/internal/disreact/entity/node-view.ts';
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
      _Button({
        label  : 'Info',
        onClick: () => {
          openView(OmniInfo);
        },
      }),
      _Button({
        label  : 'Clans',
        onClick: () => {
          openView(OmniClans);
        },
      }),
      _Button({
        label  : 'Rosters',
        onClick: () => {
          openView(OmniRosters);
        },
      }),
      _Button({
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
