import {describe} from 'vitest';
import {it} from '@effect/vitest';
import {CSL, E} from '#src/internal/pure/effect';
import {members} from './csv.ts';
import {bulk} from './bulk.ts';


describe('bulk', () => {
    it.live('account link', () => E.gen(function * () {
        for (const [tag, userId] of members) {
            yield * CSL.debug(tag, userId);
            yield * E.delay('250 milli')(E.succeed(''));
            yield * bulk(tag, userId);
        }
    }).pipe(

    ), {timeout: 0});
});
