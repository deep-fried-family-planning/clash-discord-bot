import {it} from '@effect/vitest';
import {E} from '#src/internal/pure/effect.ts';
import {type DClan, decodeDiscordClan} from '#src/dynamo/schema/discord-clan.ts';

describe('DiscordClan', () => {
    let testdata: Partial<DClan>;

    beforeEach(() => {
        testdata = {
            pk             : 's-1196596661804351519',
            sk             : 'c-#2GR2G0PGG',
            battle_opponent: 'c-',
            countdown      : '1299263512920723508',
            created        : '2024-11-12T02:28:57.309Z',
            gsi_clan_tag   : 'c-#2GR2G0PGG',
            gsi_server_id  : 's-1196596661804351519',
            prep_opponent  : 'c-',
            thread_battle  : '',
            thread_prep    : '',
            type           : 'DiscordClan',
            updated        : '2024-11-12T02:28:57.309Z',
            version        : '1.0.0',
        };
    });

    describe('given a previous version record', () => {
        beforeEach(() => {
            testdata.verification = undefined;
        });

        it.effect('when decoding to latest', () => E.gen(function * () {
            const result = yield * decodeDiscordClan(testdata);

            expect(result).toMatchInlineSnapshot(`
              {
                "battle_opponent": "",
                "countdown": "1299263512920723508",
                "created": 2024-11-12T02:28:57.309Z,
                "gsi_clan_tag": "#2GR2G0PGG",
                "gsi_server_id": "1196596661804351519",
                "pk": "1196596661804351519",
                "prep_opponent": "",
                "sk": "#2GR2G0PGG",
                "thread_battle": "",
                "thread_prep": "",
                "type": "DiscordClan",
                "updated": 2024-11-12T02:28:57.309Z,
                "verification": 0,
                "version": "1.0.0",
              }
            `);
        }));

        it.effect('when encoding to latest', () => E.gen(function * () {
            const result = yield * decodeDiscordClan(testdata);

            expect(result).toMatchInlineSnapshot(`
              {
                "battle_opponent": "",
                "countdown": "1299263512920723508",
                "created": 2024-11-12T02:28:57.309Z,
                "gsi_clan_tag": "#2GR2G0PGG",
                "gsi_server_id": "1196596661804351519",
                "pk": "1196596661804351519",
                "prep_opponent": "",
                "sk": "#2GR2G0PGG",
                "thread_battle": "",
                "thread_prep": "",
                "type": "DiscordClan",
                "updated": 2024-11-12T02:28:57.309Z,
                "verification": 0,
                "version": "1.0.0",
              }
            `);
        }));
    });
});
