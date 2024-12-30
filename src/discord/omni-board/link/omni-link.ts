import {EmbedController} from '#discord/entities/exv.ts';
import {makeView} from '#discord/entities/view.ts';
import {Nav} from '#src/discord/omni-board/nav.ts';
import {OmniBoard} from '#src/discord/omni-board/omni-board.ts';
import {MD} from '#src/internal/pure/pure.ts';


export const OmniLink = makeView('OmniLink', () => {
  return [
    EmbedController({
      title      : 'About DeepFryer',
      description: MD.content(
        'Start',
      ),
    }),
    Nav({
      back: OmniBoard.name,
    }),
  ];
});
