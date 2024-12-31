import {Ev} from '#discord/entities';
import {makeMessage} from '#discord/entities/node-view.ts';
import {NavButtons} from '#src/discord/omni-board/nav-buttons.ts';
import {OmniStart} from '#src/discord/omni-board/omni-start.ts';
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
      back: OmniStart,
    }),
  ];
});
