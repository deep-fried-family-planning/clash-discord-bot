import {E, pipe} from '#pure/effect';
import {Route, Tx, VMessage} from '#src/internal/disreact/entity/index.ts';
import {DiscordBroker} from '#src/internal/disreact/runtime-old/layers/discord-broker.ts';
import {MemoryStore} from '#src/internal/disreact/runtime-old/layers/memory-store.ts';
import {RouteManager} from '#src/internal/disreact/runtime-old/layers/route-manager.ts';
import console from 'node:console';


export const commit = E.fn('commit')(
  function * () {
    yield * E.logTrace(`[commit]`);

    const rest   = yield * RouteManager.rest();
    const params = yield * RouteManager.getParams();
    const search = yield * RouteManager.getSearch();
    const broker = yield * DiscordBroker.getCurrent();

    const url_route = pipe(
      Route.Simulated.empty(),
      Route.setPipe(params.pipe_id),
      Route.setRoot(params.root_id),
      Route.setNode(params.node_id),
      Route.setPrevious(rest.id),
      Route.setSearch(search),
      Route.setDefer(Tx.encode(broker.res_type)),
    );

    const document = yield * MemoryStore.current();

    const encodedMessage = pipe(
      document.message,
      VMessage.encodeForRestOrMemory(url_route),
    );

    console.log(broker);

    // yield * E.logTrace(`[commit]: encoded message`, inspect(encodedMessage, false, null));

    if (Tx.isOpenDialog(broker.res_type)) {
      yield * E.logTrace(`[commit]: opening dialog`);

      return yield * (MemoryStore.saveDialogMessage(broker.id, encodedMessage));
    }
    else if (!Tx.isClose(broker.res_type)) {
      yield * E.logTrace(`[commit]: message reply`);

      return yield * pipe(DiscordBroker.reply(encodedMessage));
    }
  },
  E.awaitAllChildren,
);
