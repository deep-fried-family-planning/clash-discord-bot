import type {Server, Clan, User, Player} from '#src/data/index.ts';
import type {Discord} from 'dfx';
import * as Deferred from 'effect/Deferred';
import * as E from 'effect/Effect';
import * as Layer from 'effect/Layer';
import {pipe} from 'effect/Function';

export class Interacting extends E.Service<Interacting>()('deepfryer/Caller', {
  effect: E.gen(function* () {
    const request = yield* Deferred.make<Discord.APIInteraction>();
    const server = yield* Deferred.make<Server>();
    const serverClans = yield* Deferred.make<Clan[]>();
    const user = yield* Deferred.make<User>();
    const userPlayers = yield* Deferred.make<Player[]>();

    // const getServer = (ix: Discord.APIInteraction) =>
    //   readItem(Server, ix.guild_id!, 'now').pipe(
    //     Effect.tap((item) =>
    //       Deferred.succeed(server, item),
    //     ),
    //   );
    //
    // const getClans = (ix: Discord.APIInteraction) =>
    //   readPartition(ServerClan, ix.guild_id!).pipe(
    //     Effect.tap((item) =>
    //       Deferred.succeed(serverClans, item),
    //     ),
    //   );
    //
    // const getUser = (ix: Discord.APIInteraction) =>
    //   readItem(User, ix.member!.user!.id, 'now').pipe(
    //     Effect.tap((item) =>
    //       Deferred.succeed(user, item),
    //     ),
    //   );
    //
    // const getPlayers = (ix: Discord.APIInteraction) =>
    //   readPartition(UserPlayer, ix.member!.user!.id).pipe(
    //     Effect.tap((item) =>
    //       Deferred.succeed(userPlayers, item),
    //     ),
    //   );

    return {
      request: Deferred.await(request),
      // server : Deferred.await(server),
      // user   : Deferred.await(user),
      // clans  : Deferred.await(serverClans),
      // players: Deferred.await(userPlayers),

      init: (ix: Discord.APIInteraction) =>
        pipe(
          Deferred.succeed(request, ix),
        ),
    };
  }),
  accessors: true,
}) {
  static readonly Fresh = Layer.fresh(Interacting.Default);
}
