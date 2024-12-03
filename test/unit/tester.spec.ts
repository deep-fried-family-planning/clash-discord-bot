import {it} from '@effect/vitest';
import {h, LambdaLive} from '#src/poll.ts';
import {E, g, L} from '#src/internal/pure/effect.ts';

describe('poll test', () => {
    it.live('poll', () => g(function * () {
        // yield * bust('#2GR2G0PGG');
        yield * h();
    }).pipe(
        E.provide(LambdaLive),
    ), {timeout: 0});
});
