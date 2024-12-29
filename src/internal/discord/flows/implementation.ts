import {Const, Cx, type Driver} from '#dfdis';
import {ENTRY, NO_SIM} from '#discord/entities/constants.ts';
import {clickEntrypoint} from '#discord/flows/click-entrypoint.ts';
import {clickEphemeral} from '#discord/flows/click-ephemeral.ts';
import {submitDialog} from '#discord/flows/submit-dialog.ts';
import type {IxIn} from '#discord/types.ts';
import {type RestDataComponent, type RestDataDialog, RxType} from '#pure/dfx';
import {CSL, E, g} from '#pure/effect';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import type {IxD} from '#src/internal/discord.ts';


// const [server, user] = yield * pipe(
//   [
//     MenuCache.serverRead(ix.guild_id!),
//     MenuCache.userRead(ix.member?.user?.id ?? ix.user!.id),
//   ] as const,
//   E.allWith(),
//   E.catchTag('DeepFryerDynamoError', () => E.succeed([undefined, undefined])),
// );


export const implementation = <
  A extends ReturnType<typeof Driver.make>,
>(
  driver: A,
  anyIx: IxD,
) => g(function * () {
  const ix = anyIx as IxIn;
  const ax = Cx.Path.parse(ix.data.custom_id);

  if (ax.mod === Const.CLOSE) {
    return yield * DiscordApi.deleteMenu(ix);
  }
  if (ax.mod === NO_SIM) {
    return;
  }
  if (ix.type === RxType.MODAL_SUBMIT) {
    return yield * submitDialog(driver, ax, ix, ix.data as RestDataDialog);
  }
  if (ax.mod === ENTRY) {
    return yield * clickEntrypoint(driver, ax, ix, ix.data as RestDataComponent);
  }

  return yield * clickEphemeral(driver, ax, ix);
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


// const parseIx = (ix: IxIn) => {
//   const cxm       = parseCx(ix.message!.components as RestRow[]);
//   const cxd       = parseCx('components' in ix.data ? ix.data.components as RestRow[] : []);
//   const cx        = {...cxm, ...cxd};
//   const data      = ix.data;
//   const dataRoute = v2Router.parse(ix.data.custom_id);
//
//   let values   = [] as str[];
//   let target   = {} as Cx.T;
//   let resolved = {
//     users   : {},
//     roles   : {},
//     channels: {},
//   } as nopt<RestDataResolved>;
//
//   if (isComponentIx(ix.data) && 'values' in data) {
//     target = cx[CxVR.makeAccessorFromVR(dataRoute)];
//     values = data.values as unknown as str[];
//
//     if (target._tag === 'Select') {
//       (target.data as nro<RestStringSelect>).options = target.data.options!.map((option) => ({
//         ...option,
//         default: values.includes(option.value),
//       }));
//     }
//
//     if (target._tag === 'User' || target._tag === 'Role' || target._tag === 'Channel' || target._tag === 'Mention') {
//       resolved = ix.data.resolved! as nopt<RestDataResolved>;
//
//       (target.data as nro<RestStringSelect>).default_values = values.map((v) => ({
//         id  : v as snflk,
//         type: resolveType(resolved, v as snflk),
//       }));
//     }
//   }
//
//   return {
//     cx,
//     ax: {
//       values,
//       route: dataRoute,
//       target,
//       flags: Flags.assignFlags(dataRoute),
//     },
//   };
// };
//
//
// const parseCx = (rest: RestRow[]) => p(
//   rest,
//   Ar.flatMap((cs) => cs.components.map((c) => p(
//     Cx.makeFromRest(c),
//     Cx.set('route', v2Router.parse((c as {custom_id: str}).custom_id)),
//   ))),
//   Kv.fromIterableWith((cx) => [cx.data.custom_id, cx]),
// );
