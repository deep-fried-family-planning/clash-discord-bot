import {E} from '#src/internal/pure/effect';
import {expect, it} from '@effect/vitest';
import {buildCustomId, parseCustomId} from '#src/discord/store/id.ts';
import {IXCDELIM} from '#src/discord/store/types.ts';
import {pipe} from '#src/internal/pure/effect.ts';
import {filterKV, replaceKV} from '#src/internal/pure/pure-kv.ts';
import {reducerAccounts} from '#src/discord/ixc/reducers/reducer-accounts.ts';


describe('parse routing', () => {
    it.live('does it work???', () => E.gen(function * () {
        const id = '/k/randomkind/t/randomtype/d/randomdata';

        expect(yield * parseCustomId(id)).toMatchInlineSnapshot(`
          {
            "id": "/k/randomkind/t/randomtype/d/randomdata",
            "params": {
              "data": [],
              "kind": "randomkind",
              "type": "randomtype",
            },
            "template": "/k/:kind/t/:type/d/:data",
          }
        `);
    }));


    it.live('does it work???', () => E.gen(function * () {
        const id = {
            kind: 'B',
            type: 'New Link',
            data: [],
        };


        const redefined = {
            ...id,
            data: id.data.join(IXCDELIM.DATA),
        } as const;

        const defined = pipe(
            redefined,
            replaceKV('data', id.data.join(IXCDELIM.DATA)),
            filterKV((a, key) => {
                console.log(a, key);
                return Boolean(a);
            }),
        );

        console.log('actions', reducerAccounts);

        expect(defined).toMatchInlineSnapshot(`
          {
            "data": "",
            "kind": "B",
            "type": "New Link",
          }
        `);
    }));
});


describe('build routing', () => {
    it.live('does this work???????', () => E.gen(function * () {
        const rows = ['first', 'last'];

        const [first, ...rest] = rows;
        const [last, ...middleRev] = rest.toReversed();
        const middle = middleRev.toReversed();

        expect(first).toMatchInlineSnapshot(`"first"`);
        expect(last).toMatchInlineSnapshot(`"last"`);
        expect(middle).toMatchInlineSnapshot(`[]`);
    }));
});
