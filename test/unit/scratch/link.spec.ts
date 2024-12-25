import {makeDiscordPlayer} from '#src/discord/commands/oneofus.ts';
import {putDiscordPlayer} from '#src/dynamo/schema/discord-player.ts';
import {E, g} from '#src/internal/pure/effect.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {describe, it} from '@effect/vitest';


const userId = '358621794204123148';


const accounts = [
    '#QJ9LYL2V',
    '#JVVQ2YJL',
    '#GPR2J2LPV',
];


describe('link', () => {
    it.live('linking', () => g(function * () {
        for (const tag of accounts) {
            yield * putDiscordPlayer(makeDiscordPlayer(userId, tag, 1, 'main'));
        }
    }).pipe(
        E.provide(
            DynamoDBDocument.defaultLayer,
        ),
    ));
});
