import type {Driver} from '#dfdis';
import {Const, Cx, CxVR, Flags} from '#dfdis';
import {makeGrid} from '#discord/entities/cxt.ts';
import {createHookContext, updateHookContext} from '#discord/hooks/context.ts';
import {v2Router} from '#discord/model-routing/ope.ts';
import {resolveIx, saveIx} from '#discord/relay.ts';
import {isComponentIx, type IxIn} from '#discord/utils/types.ts';
import {type RestDataResolved, type RestRow, type RestStringSelect, RxType, TxFlag, TxType} from '#pure/dfx';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import type {snflk} from '#src/discord/types.ts';
import {MenuCache} from '#src/dynamo/cache/menu-cache.ts';
import type {IxD} from '#src/internal/discord.ts';
import {Ar, CSL, E, g, Kv, p, pipe} from '#src/internal/pure/effect.ts';
import type {nopt, nro, str} from '#src/internal/pure/types-pure.ts';


const parseCx = (rest: RestRow[]) => p(
  rest,
  Ar.flatMap((cs) => cs.components.map((c) => p(
    Cx.makeFromRest(c),
    Cx.set('route', v2Router.parse((c as {custom_id: str}).custom_id)),
  ))),
  Kv.fromIterableWith((cx) => [cx.data.custom_id, cx]),
);


export const implementation = <
  A extends ReturnType<typeof Driver.make>,
>(
  driver: A,
  anyIx: IxD,
) => g(function * () {
  if (anyIx.type === RxType.MODAL_SUBMIT) {
    yield * DiscordApi.deferUpdate(anyIx);
  }


  const ix = anyIx as IxIn;
  const ax = v2Router.parse(ix.data.custom_id);


  const [server, user] = yield * pipe(
    [
      MenuCache.serverRead(ix.guild_id!),
      MenuCache.userRead(ix.member?.user?.id ?? ix.user!.id),
    ] as const,
    E.allWith(),
    E.catchTag('DeepFryerDynamoError', () => E.succeed([undefined, undefined])),
  );


  if (ax.mod === Const.CLOSE) {
    return yield * DiscordApi.deleteMenu(ix);
  }


  const axdx = parseCx('components' in ix.data ? ix.data.components as RestRow[] : []);
  const rx   = ix.type === RxType.MODAL_SUBMIT ? yield * resolveIx(ax.mod) : ix;
  const rxcx = parseCx(rx.message!.components as RestRow[]);


  if (anyIx.type === RxType.MODAL_SUBMIT) {
    const ix_context     = createHookContext(driver.name, ax.view, rx.message?.embeds[0] ?? {});
    const ax_preview     = driver.views[ax.dialog].view(driver.name, ax.view);
    const rx_preview     = driver.views[ax.view].view(driver.name);
    const updatedContext = updateHookContext(ix_context, rx_preview.embeds);

    return yield * DiscordApi.editMenu(ix, {
      embeds    : updatedContext.embeds,
      components: makeGrid(rx_preview.components),
    });
  }

  const context = createHookContext(driver.name, ax.view, rx.message?.embeds[0] ?? {});
  const preview = driver.views[ax.view].view(driver.name);

  preview.components.flat().find((vx) => vx.route.row === ax.row && vx.route.col === ax.col)?.onClick?.({}, {});

  const nextView = context.views[1];

  if (context.views[2] === Const.DIALOG) {
    const view_dialog = driver.views[nextView].view(driver.name);

    const custom_id = p(
      view_dialog.dialog.route,
      v2Router.set('view', ax.view),
      v2Router.set('mod', ix.id),
      v2Router.build,
    );

    yield * DiscordApi.openModal(ix, {
      custom_id : custom_id,
      title     : view_dialog.dialog.title,
      components: makeGrid(view_dialog.components),
    });

    const view_message   = driver.views[ax.view].view(driver.name);
    const updatedContext = updateHookContext(context, view_message.embeds);

    return yield * saveIx({
      ...ix,
      message: {
        ...ix.message,
        embeds    : updatedContext.embeds,
        components: makeGrid(view_message.components),
      },
    } as IxIn);
  }

  const defer = ax.mod === Const.ENTRY
    ? {
      type: TxType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        flags: TxFlag.EPHEMERAL,
      },
    }
    : {
      type: TxType.DEFERRED_UPDATE_MESSAGE,
    };

  yield * DiscordApi.createInteractionResponse(ix.id, ix.token, defer);

  const view           = driver.views[nextView].view(driver.name);
  const grid           = makeGrid(view.components);
  const updatedContext = updateHookContext(context, view.embeds);

  return yield * DiscordApi.editMenu(ix, {
    embeds    : updatedContext.embeds,
    components: grid,
  });
}).pipe(
  // E.catchAll((e) => CSL.debug(inspect(e, false, null))),
  E.catchAllDefect((e) => CSL.debug(e)),
);


// const scp = p(sx, Kv.filter((v) => v.route.name === ax.route.name));
// let scn   = {};
//
// if (ax.flags.includes(Flags.Id.Action)) {
//   const slice       = driver.slices[ax.route.name!];
//   const action      = slice.reducers[ax.route.action!];
//   const data        = driver.slices[ax.route.name!].data;
//   const scp_aliased = p(scp, Kv.mapEntries((v) => [data[v.route.data!].data, v]));
//   const scn_aliased = yield * action({}, scp_aliased);
//
//   scn = p(scn_aliased, Kv.mapEntries((v, k) => {
//     const spec = data[k];
//     return [CxVR.makeAccessor(spec.slice, spec.data), Cx.C[spec.type](v as never)];
//   }));
// }


const parseIx = (ix: IxIn) => {
  const cxm       = parseCx(ix.message!.components as RestRow[]);
  const cxd       = parseCx('components' in ix.data ? ix.data.components as RestRow[] : []);
  const cx        = {...cxm, ...cxd};
  const data      = ix.data;
  const dataRoute = v2Router.parse(ix.data.custom_id);

  let values   = [] as str[];
  let target   = {} as Cx.T;
  let resolved = {
    users   : {},
    roles   : {},
    channels: {},
  } as nopt<RestDataResolved>;

  if (isComponentIx(ix.data) && 'values' in data) {
    target = cx[CxVR.makeAccessorFromVR(dataRoute)];
    values = data.values as unknown as str[];

    if (target._tag === 'Select') {
      (target.data as nro<RestStringSelect>).options = target.data.options!.map((option) => ({
        ...option,
        default: values.includes(option.value),
      }));
    }

    if (target._tag === 'User' || target._tag === 'Role' || target._tag === 'Channel' || target._tag === 'Mention') {
      resolved = ix.data.resolved! as nopt<RestDataResolved>;

      (target.data as nro<RestStringSelect>).default_values = values.map((v) => ({
        id  : v as snflk,
        type: resolveType(resolved, v as snflk),
      }));
    }
  }

  return {
    cx,
    ax: {
      values,
      route: dataRoute,
      target,
      flags: Flags.assignFlags(dataRoute),
    },
  };
};


const resolveType = (resolved: nopt<RestDataResolved>, val: snflk) =>
  resolved.users?.[val] ? 'user'
    : resolved.roles?.[val] ? 'role'
      : resolved.channels?.[val] ? 'channel'
        : 'fail';
