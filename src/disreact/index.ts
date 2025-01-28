import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import type {TagFunc} from '#src/disreact/model/dsx/types.ts';
import {OmniStart} from '#src/disreact/omni-board/omni-start.tsx';
import {respond} from '#src/disreact/respond.ts';
import {ContextManager} from '#src/disreact/runtime/layer/ContextManager.ts';
import {Broker} from '#src/disreact/runtime/layer/DisReactBroker.ts';
import {FiberDOM} from '#src/disreact/runtime/layer/FiberDOM.ts';
import {StaticDOM} from '#src/disreact/runtime/layer/StaticDOM.ts';
import {TokenMemory} from '#src/disreact/runtime/layer/TokenMemory.ts';
import {synthesize} from '#src/disreact/synthesize.ts';
import {E, flow, L, Logger, LogLevel, pipe, RDT} from '#src/internal/pure/effect.ts';
import {NodeHttpClient} from '@effect/platform-node';
import {DiscordConfig, DiscordRESTMemoryLive} from 'dfx/index';



export const createDisReact = (
  bot_token: string,
  types: TagFunc[],
) => {
  const baseRequirements = pipe(
    StaticDOM.makeLayer(types),
    L.provideMerge(Broker.singleton),
    L.provideMerge(DiscordApi.Live),
    L.provideMerge(DiscordRESTMemoryLive),
    L.provideMerge(NodeHttpClient.layerUndici),
    L.provideMerge(DiscordConfig.layer({token: RDT.make(bot_token)})),
    L.provideMerge(Logger.replace(Logger.defaultLogger, Logger.prettyLoggerDefault)),
    L.provideMerge(Logger.minimumLogLevel(LogLevel.All)),
  );

  const responseRequirements = pipe(
    ContextManager.makeLayer(),
    L.provideMerge(FiberDOM.makeLayer()),
    L.provideMerge(baseRequirements),
    L.provideMerge(TokenMemory.singleton(process.env.DDB_OPERATIONS)),
  );

  return {
    synthesize: flow(synthesize, E.provide(baseRequirements)),
    respond   : flow(respond, E.provide(responseRequirements)),
  };
};


export const DisReactDOM = createDisReact(
  process.env.DFFP_DISCORD_BOT_TOKEN,
  [
    OmniStart,
  ],
);
