import {Schema} from 'effect';
import {E} from '#src/utils/effect.ts';

describe('deep fryer branded types', () => {
    it('testy mctest', () => {
        const schema = Schema.String.pipe(Schema.startsWith('clan-'));

        console.log(E.runSync(Schema.encodeUnknown(Schema.encodedBoundSchema(schema))('clan-123456789')));
    });
});
