import {OmniPublic} from '#src/discord/omni-board/omni-public.tsx';
import {DisReactDOM} from '#src/disreact/index.ts';



export const DeepFryerModel = DisReactDOM.makeLayer({
  bot  : process.env.DFFP_DISCORD_BOT_TOKEN,
  types: [
    OmniPublic,
  ],
});
