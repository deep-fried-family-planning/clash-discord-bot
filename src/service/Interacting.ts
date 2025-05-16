import type {Server, ServerClan, User, UserPlayer} from '#src/data/index.ts';
import type {Discord} from 'dfx';
import * as Deferred from 'effect/Deferred';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import {pipe} from 'effect/Function';

export class Interacting extends Effect.Service<Interacting>()('deepfryer/Caller', {
  effect: Effect.gen(function* () {
    const request = yield* Deferred.make<Discord.APIInteraction>();
    const server = yield* Deferred.make<Server>();
    const serverClans = yield* Deferred.make<ServerClan[]>();
    const user = yield* Deferred.make<User>();
    const userPlayers = yield* Deferred.make<UserPlayer[]>();

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
