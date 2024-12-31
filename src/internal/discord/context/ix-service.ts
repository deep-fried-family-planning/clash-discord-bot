import {CLOSE, NONE} from '#discord/constants/constants.ts';
import {startContext, stopContext} from '#discord/context/context.ts';
import {getPreviousIxForDialog, saveCurrentIxForDialog} from '#discord/context/dialog-relay.ts';
import type {Driver} from '#discord/context/model-driver.ts';
import {emptyIxContext, type InteractionContext} from '#discord/context/types.ts';
import {Cx, Nx} from '#discord/entities';
import {DeveloperError, DiscordError} from '#discord/entities/errors.ts';
import {isDialogSubmit, type IxIn} from '#discord/types.ts';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import {MenuCache} from '#src/dynamo/cache/menu-cache.ts';
import {C, E, g, L} from '#src/internal/pure/effect';
import type {str} from '#src/internal/pure/types-pure.ts';
import type {EA} from '#src/internal/types.ts';
import console from 'node:console';


const program = g(function * () {
  let context = emptyIxContext();

  const cache = yield * C.make({
    timeToLive: '5 minute',
    capacity  : 50,
    lookup    : (key: str) => getPreviousIxForDialog(key),
  });

  return {
    value : () => context as unknown as InteractionContext,
    server: MenuCache.serverRead(context.server_id),
    user  : MenuCache.userRead(context.user_id),
    auth  : [],


    start: (driver: Driver, ix: IxIn) => g(function * () {
      console.log('[init]', ix.id);
      console.log('[init]', context.ix.id);

      context.driver = driver;
      context.ix     = ix;

      console.log('[init]', ix.id);
      console.log('[set]', context.ix.id);

      context.server_id = ix.guild_id ?? NONE;
      context.user_id   = ix.user?.id ?? ix.member?.user?.id ?? NONE;
      context.ax.path   = Cx.Path.parse(ix.data.custom_id);

      console.log(ix.data.custom_id);


      if (!(context.ax.path.view in driver.views)) return yield * new DeveloperError({});

      if (context.ax.path.mod === CLOSE) {
        console.log('[DEFER]: update');
        return yield * DiscordApi.deferUpdate(context.ix);
      }
      else if (isDialogSubmit(context.ix)) {
        context.dialog.init = ix;
        context.dialog.rest = Nx.decodeDialog(context.dialog.init);

        context.message.init = yield * cache.get(context.ax.path.mod);
        context.message.rest = Nx.decodeMessage(context.message.init, context.ax.path);

        context.curr.rest = context.dialog.rest;
        context.next.rest = context.message.rest;
      }
      else {
        context.message.init = context.ix;
        context.message.rest = Nx.decodeMessage(context.message.init, context.ax.path);

        context.curr.rest = context.message.rest;
      }

      startContext(context.message.rest.embeds, context.ax.path);

      return context;
    }),

    resolveActionTarget: g(function * () {
      if (context.curr.data._tag !== 'Message') return yield * new DeveloperError({});

      const rest = context.message.rest.components.at(context.ax.path.row)?.at(context.ax.path.col);
      const data = context.message.data.components.at(context.ax.path.row)?.at(context.ax.path.col);

      if (!rest) return yield * new DiscordError({});
      if (!data) return yield * new DeveloperError({});

      context.ax.rest = rest;
      context.ax.data = data;

      return context.ax;
    }),

    currentViewNode: g(function * () {
      if (!(context.ax.path.view in context.driver.views)) return yield * new DeveloperError({});
      context.curr.view = context.driver.views[context.ax.path.view];
      return context.curr.view;
    }),

    saveMessage: g(function * () {
      if (context.message.sent._tag === 'Dialog') return yield * new DeveloperError({});
      context.message.init = yield * saveCurrentIxForDialog(context.ix, context.message.sent.embeds, context.message.sent.components);
    }),

    reset: () => {
      stopContext();
      context = emptyIxContext();
      console.log('[reset]', context.ix.id);
    },
  };
});


export class IxService extends E.Tag('IxCtx')<
  IxService,
  EA<typeof program>
>() {
  static Live = L.effect(this, program);
}
