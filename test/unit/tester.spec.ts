import {E, g} from '#src/internal/pure/effect.ts';
import {h, LambdaLive} from '#src/poll.ts';
import {it} from '@effect/vitest';


describe('poll test', () => {
    it.live('poll', () => g(function * () {
        // yield * bust('#2GR2G0PGG');
        yield * h();
    }).pipe(
        E.provide(LambdaLive),
    ), {timeout: 0});
});
