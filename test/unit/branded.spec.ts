import {Console, DateTime, Schema} from 'effect';
import {DT, E} from '#src/internals/re-exports/effect.ts';
import {ServerId} from '#src/dynamo/common.ts';

const str
    = '{ readonly pk: a string starting with "server-"; readonly sk: a string starting with "clan-"; readonly type: "DiscordClan"; readonly version: "1.0.0"; readonly created: Date; readonly updated: Date; readonly gsi_server_id: a string starting with "server-"; readonly gsi_clan_tag: a string starting with "clan-"; readonly thread_prep: string; readonly prep_opponent: a string starting with "clan-"; readonly thread_battle: string; readonly battle_opponent: a string starting with "clan-"; readonly countdown: string }\n└─ ["battle_opponent"]\n   └─ a string starting with "clan-"\n      └─ Predicate refinement failure\n         └─ Expected a string starting with "clan-", actual "#QUJLU28U"';
describe('deep fryer branded types', () => {
    it('testy mctest', () => {
        console.log(E.runSyncExit(E.gen(function * () {
            const tz = yield * Schema.decodeUnknown(Schema.TimeZone)('Asia/Tokyo');

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
