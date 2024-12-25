import {Cron, CSL, DT, E, g} from '#src/internal/pure/effect.ts';
import {h, LambdaLive} from '#src/poll.ts';
import {it} from '@effect/vitest';


describe('poll test', () => {
    it.live('poll', () => h().pipe(E.provide(LambdaLive)), {timeout: 0});
});

describe('test', () => {
    it.live('poll', () => g(function *() {
        const raidWeekendDone = Cron.make({
            days    : [],
            hours   : [],
            minutes : [],
            months  : [],
            weekdays: [1, 2, 3],
            tz      : DT.zoneMakeLocal(),
        });

        yield * CSL.log(Cron.match(raidWeekendDone, yield * DT.now), Cron.next(raidWeekendDone));
    }));
});
