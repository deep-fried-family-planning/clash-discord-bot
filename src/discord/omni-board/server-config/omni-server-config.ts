import {NavButtons} from '#src/discord/omni-board/nav-buttons.ts';
import {OmniStart} from '#src/discord/omni-board/omni-start.ts';
import {makeMessage} from '#src/internal/disreact/entity/node-view.ts';
import {MD} from '#src/internal/pure/pure';
import {Ev} from 'src/internal/disreact/entity';


export const OmniServerConfig = makeMessage('OmniServerConfig', () => {
  return [
    Ev.Controller({
      title      : 'Server Configuration',
      description: MD.content(
        'Start',
      ),
    }),
    NavButtons({
      back: OmniStart,
    }),
  ];
});
