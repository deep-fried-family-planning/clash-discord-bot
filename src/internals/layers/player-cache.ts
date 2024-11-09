import {Console, Context, Layer} from 'effect';
import {E, pipe} from '#src/internals/re-exports/effect.ts';
import {type DPlayer, scanDiscordPlayers} from '#src/database/discord-player.ts';
import {reduceL} from '#src/pure/pure-list.ts';

export class PlayerCache extends Context.Tag('DeepFryerPlayerCache')<
    PlayerCache,
    Record<string, DPlayer>
>() {}

export const PlayerCacheLive = Layer.effect(
    PlayerCache,
    E.gen(function* () {
        yield * Console.log('player cache');
        const players = yield * scanDiscordPlayers();

        return pipe(
            players,
            reduceL({} as Record<string, DPlayer>, (acc, a) => {
                acc[a.sk.split('p-')[1]] = a;

                return acc;
            }),
        );
    }),
);
