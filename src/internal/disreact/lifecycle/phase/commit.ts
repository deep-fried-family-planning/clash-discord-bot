import {E, g, pipe} from '#pure/effect';
import {Route, Tx, VMessage} from '#src/internal/disreact/entity/index.ts';
import {DiscordBroker} from '#src/internal/disreact/lifecycle/layers/discord-broker.ts';
import {MemoryStore} from '#src/internal/disreact/lifecycle/layers/memory-store.ts';
import {RouteManager} from '#src/internal/disreact/lifecycle/layers/route-manager.ts';


export const commit = g(function * () {
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
    Route.setQuery(search),
    Route.setDefer(Tx.encode(broker.res_type)),
  );

  const document = yield * MemoryStore.current();

  const encodedMessage = pipe(
    document.message,
    VMessage.encodeForRestOrMemory(url_route),
  );

  if (Tx.isOpenDialog(broker.res_type)) {
    return yield * E.fork(MemoryStore.saveDialogMessage(broker.id, encodedMessage));
  }
  else {
    return yield * DiscordBroker.reply(encodedMessage);
  }
});
