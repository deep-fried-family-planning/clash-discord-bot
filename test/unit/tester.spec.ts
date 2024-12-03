import {it} from '@effect/vitest';
import {handler} from '#src/poll.ts';

describe('poll test', () => {
    it.live('poll', handler({}, {}));
});
