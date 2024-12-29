import {Driver} from '#dfdis';
import {OmniClans} from '#src/discord/omni-board/clans/omni-clans.ts';
import {OmniInfo} from '#src/discord/omni-board/info/omni-info.ts';
import {OmniBoard} from '#src/discord/omni-board/omni-board.ts';


export const v2driver = Driver.make({
  name  : 'v2driver',
  slices: [],
  views : [
    OmniBoard,
    OmniInfo,
    OmniClans,
  ],
});
