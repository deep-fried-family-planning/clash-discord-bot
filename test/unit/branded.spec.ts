import {Schema} from 'effect';
import {CSL, DT, E} from '#src/internal/pure/effect.ts';
import {ServerId} from '#src/dynamo/common.ts';


describe('deep fryer branded types', () => {
    it('testy mctest', () => {
        console.log(E.runSyncExit(E.gen(function * () {
            const tz = yield * Schema.decodeUnknown(Schema.TimeZone)('Asia/Tokyo');

            yield * CSL.log(tz);

            const zoned = yield * DT.nowInCurrentZone;

            const now = DT.addDuration('1 minutes')(zoned);

            const ope = yield * Schema.decodeUnknown(ServerId)('s-1234');
            const ope2 = yield * Schema.encodeUnknown(ServerId)('1234');

            return [ope, ope2, now, DT.formatIso(now).replace(/\..+Z/, '')];
        }).pipe(E.provide(DT.layerCurrentZoneLocal))));

        // console.log(decodeURIComponent('/players/%23ASDF'));
        // console.log(str);
    });
});
