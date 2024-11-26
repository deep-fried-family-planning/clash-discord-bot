import {describe} from 'vitest';
import {it} from '@effect/vitest';
import {CSL, E, L} from '#src/internal/pure/effect';
import {members} from './csv.ts';
import {bulk} from './bulk.ts';
import {makeLambdaLayer} from '#src/internal/lambda-layer.ts';
import {Clashofclans} from '#src/clash/api/clashofclans.ts';
import {Clashking} from '#src/clash/api/clashking.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';


describe('bulk', () => {
    it.live('account link', () => E.gen(function * () {
        for (const [tag, userId] of members) {
            yield * CSL.debug(tag, userId);
            yield * E.delay('250 milli')(E.succeed(''));
            yield * bulk(tag, userId);
        }
    }).pipe(
        E.provide(makeLambdaLayer({
            caches: [L.empty],

            apis: [
                Clashofclans.Live,
                Clashking.Live,
            ],
            aws: [
                DynamoDBDocument.defaultLayer,
            ],
        })),
    ), {timeout: 0});
});
