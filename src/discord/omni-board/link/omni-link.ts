import {Ev} from '#discord/entities/basic';
import {makeMessage} from '#discord/entities/basic/node-view.ts';
import {NavButtons} from '#src/discord/omni-board/nav-buttons.ts';
import {OmniBoard} from '#src/discord/omni-board/omni-board.ts';
import {MD} from '#src/internal/pure/pure.ts';


export const OmniLink = makeMessage('OmniLink', () => {
  return [
    Ev.Controller({
      title      : 'About DeepFryer',
      description: MD.content(
        'Start',
      ),
    }),
    NavButtons({
      back: OmniBoard,
    }),
  ];
});
