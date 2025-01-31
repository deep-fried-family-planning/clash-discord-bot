import {Doken, NONE, Rest, Tags} from '#src/disreact/enum/index.ts';
import type {TagFunc} from '#src/disreact/model/types.ts';
import {CLOSE_SWITCH, GlobalPages} from '#src/disreact/model/danger.ts';
import {decodeHooks} from '#src/disreact/model/hook-state.ts';
import type {DisReactNode} from '#src/disreact/model/node.ts';
import {dismountTree, findNodeById, renderTree} from '#src/disreact/model/traversal.ts';
import {OmniStart} from '#src/omni-board/omni-start.tsx';
import {decodeInteraction, encodeInteraction} from '#src/disreact/runtime/codec.ts';
import {CriticalFailure, DiscordDOM, DokenCache, FiberDOM, InteractionContext, StaticDOM} from '#src/disreact/runtime/service.ts';
import {E, flow, L, Logger, LogLevel, pipe, RDT} from '#src/internal/pure/effect.ts';
import type {EAR} from '#src/internal/types.ts';
import {NodeHttpClient} from '@effect/platform-node';
import {DiscordRESTMemoryLive} from 'dfx';
import {DiscordConfig} from 'dfx/index';



export const synthesize = E.fn('DisReact.synthesize')(function * (type: string | TagFunc) {
  yield * InteractionContext.free();

  const cloned = typeof type === 'string'
    ? yield * StaticDOM.checkout(type, type)
    : yield * StaticDOM.checkout(type.name, type.name);

  const rendered = renderTree(cloned);

  return yield * encodeInteraction(rendered);
});


export const respond = E.fn('DisReact.respond')(function * (rest: Rest.Interaction) {
  const ix        = yield * decodeInteraction(rest);
  const params    = ix.route.params;
  const root      = params.root;
  const node      = params.node;
  const restDoken = Doken.makeFromRest(ix.rest);
  const currDoken = Doken.decode(ix.route.params);
  currDoken.app   = ix.rest.application_id;

  const cloned       = yield * StaticDOM.checkout(root, node);
  const hydrated     = renderTree(cloned, decodeHooks(ix.route.search));
  const isCurrDialog = hydrated.nodes[0].type === Tags.dialog;

  const target  = findNodeById(hydrated, ix.event)!;
  const nearest = target.handleEvent(ix.event);
  const page    = GlobalPages.get(nearest) ?? NONE;

  let next: DisReactNode;
  let doken: Doken.T;

  if (page === CLOSE_SWITCH) {
    if (currDoken.status === 'expired') {
      // yield * pipe(DiscordDOM.deferRender(restDoken), E.fork);
      yield * pipe(DiscordDOM.dismount(restDoken), E.fork);
      yield * pipe(DokenCache.destroy(currDoken), E.fork);
      return;
    }
    else {
      yield * pipe(DiscordDOM.dismount(currDoken), E.fork);
      yield * pipe(DokenCache.destroy(currDoken), E.fork);
      return;
    }
  }

  if (page === node) {
    next = renderTree(hydrated);
  }
  else {
    dismountTree(hydrated);
    next = renderTree(yield * StaticDOM.checkout(root, page));
  }

  if (next.nodes[0].type === Tags.dialog) {
    if (isCurrDialog) {
      return yield * new CriticalFailure({
        why: `${root}/${node} => ${root}/${page}: dialog render conflict`,
      });
    }
    doken         = restDoken;
    doken.type    = Rest.OPEN;
    const encoded = yield * encodeInteraction(next, doken, root);

    yield * pipe(DiscordDOM.renderDirect(doken, encoded), E.fork);
    return;
  }

  if (currDoken.status !== 'deferred') {
    restDoken.type = Rest.DEFER_UPDATE;

    yield * DiscordDOM.deferRender(restDoken);

    doken         = Doken.makeDeferred(restDoken);
    const encoded = yield * encodeInteraction(next, doken, root);

    yield * pipe(DiscordDOM.renderReply(doken, encoded), E.fork);
    yield * pipe(DokenCache.destroy(currDoken), E.fork);
    return;
  }

  yield * pipe(DiscordDOM.acknowledge(restDoken), E.fork);

  const encoded = yield * encodeInteraction(next, currDoken, root);
  yield * pipe(DiscordDOM.renderReply(currDoken, encoded), E.fork);
  return;
});


const disReactDOM = () => E.gen(function * () {
  return {
    synthesize: flow(
      synthesize,
      E.awaitAllChildren,
      E.provide(pipe(
        InteractionContext.makeLayer(),
        L.provideMerge(FiberDOM.makeLayer()),
      )),
    ),
    respond: flow(
      respond,
      E.awaitAllChildren,
      E.provide(pipe(
        InteractionContext.makeLayer(),
        L.provideMerge(FiberDOM.makeLayer()),
      )),
    ),
  };
});


export class DisReactDOM extends E.Tag('DisReact.DisReactDOM')<
  DisReactDOM,
  EAR<typeof disReactDOM>
>() {
  static makeLayer = (
    config: {
      bot      : string;
      types    : TagFunc[];
      logLevel?: LogLevel.LogLevel;
    },
  ) => pipe(
    L.empty,
    L.provideMerge(
      pipe(
        Logger.replace(Logger.defaultLogger, Logger.prettyLoggerDefault),
        L.provideMerge(Logger.minimumLogLevel(config.logLevel ?? LogLevel.All)),
        L.provideMerge(L.setTracerTiming(true)),
        L.provideMerge(L.setTracerEnabled(true)),
      ),
    ),
    L.provideMerge(
      pipe(
        L.effect(this, disReactDOM()),
        L.merge(DiscordDOM.singletonLayer),
        L.merge(StaticDOM.singletonLayer(config.types)),
        L.merge(DokenCache.singletonLayer),
      ),
    ),
    L.provide(
      pipe(
        DiscordRESTMemoryLive,
        L.provide(NodeHttpClient.layerUndici),
        L.provide(DiscordConfig.layer({token: RDT.make(config.bot)})),
      ),
    ),
  );
}

export const DRROOT = DisReactDOM.makeLayer({
  bot  : process.env.DFFP_DISCORD_BOT_TOKEN,
  types: [
    OmniStart,
  ],
});
