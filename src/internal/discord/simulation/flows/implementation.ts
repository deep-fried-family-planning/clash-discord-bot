import {Const, Cx, type Driver} from '#dfdis';
import {ENTRY, NO_SIM} from '#discord/entities/constants/constants.ts';
import {clickEntrypoint} from '#discord/simulation/flows/click-entrypoint.ts';
import {clickEphemeral} from '#discord/simulation/flows/click-ephemeral.ts';
import {submitDialog} from '#discord/simulation/flows/submit-dialog.ts';
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
