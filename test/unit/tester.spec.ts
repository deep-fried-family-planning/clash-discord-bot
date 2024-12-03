import {it} from '@effect/vitest';
import {h, handler, LambdaLive} from '#src/poll.ts';
import {E, g, L} from '#src/internal/pure/effect.ts';

describe('poll test', () => {
    it.live('poll', () => g(function * () {
        yield * h();
    }).pipe(
        E.provide(LambdaLive),
    ), {timeout: 0});
});
