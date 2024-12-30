import {makeDriver} from '#discord/context/model-driver.ts';
import {OmniClans} from '#src/discord/omni-board/clans/omni-clans.ts';
import {OmniDeepFryer} from '#src/discord/omni-board/deepfryer/omni-deep-fryer.ts';
import {OmniInfo} from '#src/discord/omni-board/info/omni-info.ts';
import {OmniLink} from '#src/discord/omni-board/link/omni-link.ts';
import {OmniBoard} from '#src/discord/omni-board/omni-board.ts';
import {OmniRosters} from '#src/discord/omni-board/rosters/omni-rosters.ts';


export const v2driver = makeDriver({
  name  : 'v2driver',
  slices: [],
  views : [
    OmniBoard,
    OmniLink,
    OmniInfo,
    OmniClans,
    OmniRosters,
    OmniDeepFryer,
  ],
});
