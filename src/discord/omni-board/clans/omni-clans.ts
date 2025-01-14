import {NavButtons} from '#src/discord/omni-board/nav-buttons.ts';
import {OmniStart} from '#src/discord/omni-board/omni-start.ts';
import {makeMessage} from '#src/internal/disreact/entity/node-view.ts';
import {MD} from '#src/internal/pure/pure.ts';
import {Ev} from 'src/internal/disreact/entity';


export const OmniClans = makeMessage('OmniClans', () => {
  return [
    Ev.Controller({
      title      : 'Clans',
      description: MD.content(
        'Start',
      ),
    }),
    NavButtons({
      back: OmniStart,
    }),
  ];
});
