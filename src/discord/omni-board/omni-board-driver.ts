import {makeDriver} from '#discord/context/model-driver.ts';
import {OmniClans} from '#src/discord/omni-board/clans/omni-clans.ts';
import {OmniDeepFryer} from '#src/discord/omni-board/deepfryer/omni-deep-fryer.ts';
import {OmniInfo} from '#src/discord/omni-board/info/omni-info.ts';
import {OmniLink} from '#src/discord/omni-board/link/omni-link.ts';
import {OmniStart} from '#src/discord/omni-board/omni-start.ts';
import {OmniRosters} from '#src/discord/omni-board/rosters/omni-rosters.ts';
import {OmniServerConfig} from '#src/discord/omni-board/server-config/omni-server-config.ts';


export const v2driver = makeDriver({
  name  : 'v2driver',
  slices: [],
  views : [
    OmniStart,
    OmniLink,
    OmniInfo,
    OmniClans,
    OmniRosters,
    OmniServerConfig,
    OmniDeepFryer,
  ],
});
