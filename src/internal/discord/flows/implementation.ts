import {CLOSE, DIALOG, ENTRY} from '#discord/constants/constants.ts';
import {IxService} from '#discord/context/ix-service.ts';
import {Nx, Tx} from '#discord/entities';
import {getNextView, getViewModifier} from '#discord/hooks/hooks.ts';
import {isDialogSubmit} from '#discord/types.ts';
import type {RestDataComponent} from '#pure/dfx';
import {CSL, E, g, p, pipe} from '#pure/effect';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import type {unk} from '#src/internal/pure/types-pure.ts';
import console from 'node:console';
import {inspect} from 'node:util';


export const implementation = g(function * () {
  const {ax, ix, driver, curr, next, message, dialog} = yield * IxService.value();
  console.log('[implementation]', ix.id);


  if (ax.path.mod === CLOSE) {
    console.log('[DELETE]');
    return yield * DiscordApi.deleteMenu(ix).pipe(E.ignoreLogged);
  }


  if (ax.path.mod === ENTRY) {
    console.log('[DEFER]: entry');
    yield * DiscordApi.deferEntryEphemeral(ix);

    return yield * p(
      Nx.renderViewNode(driver.views[ax.path.view]),
      E.map(Nx.encodeMessage()),
      E.flatMap(Tx.reply(ix)),
    );
  }


  if (isDialogSubmit(ix)) {
    console.log('[DEFER]: dialog submit');
    yield * DiscordApi.deferUpdate(ix);

    const dialog_rest = curr.rest;
    const dialog_view = yield * IxService.currentViewNode;
    yield * Nx.renderViewNode(dialog_view);

    const message_rest = message.rest;
    const message_view = driver.views[getNextView()];
    const message_data = yield * Nx.renderViewNode(message_view);

    return yield * pipe(
      message_data,
      Nx.encodeMessage(message_rest, dialog_rest),
      Tx.reply(ix),
    );
  }


  const current_rest = curr.rest;
  const current_view = yield * IxService.currentViewNode;
  const current_data = yield * pipe(
    Nx.renderViewNode(current_view),
    E.flatMap(Nx.simulateViewNodeClick(ix.data as unk as RestDataComponent, ix, current_rest)),
  );

  const next_view        = driver.views[getNextView()];
  const nextViewModifier = getViewModifier();


  if (nextViewModifier === DIALOG) {
    yield * p(
      Nx.renderViewNode(next_view),
      E.map(Nx.encodeDialog(current_rest)),
      E.flatMap(Tx.reply(ix)),
    );

    message.sent = p(
      current_data,
      Nx.encodeMessage(current_rest),
    );

    return yield * IxService.saveMessage;
  }


  console.log('[DEFER]: update');
  yield * DiscordApi.deferUpdate(ix);


  if (nextViewModifier === CLOSE) {
    return yield * DiscordApi.deleteMenu(ix);
  }


  if (current_view.name === next_view.name) {
    return yield * pipe(
      current_data,
      Nx.encodeMessage(current_rest),
      Tx.reply(ix),
    );
  }

  return yield * p(
    Nx.renderViewNode(next_view),
    E.map(Nx.encodeMessage()),
    E.flatMap(Tx.reply(ix)),
  );
}).pipe(
  // E.catchAll((e) => CSL.debug(inspect(e, false, null))),

  E.catchAllDefect((e) => CSL.debug(inspect(e, false, null))),
);
