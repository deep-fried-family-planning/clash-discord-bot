import {RestCache} from '#src/clash/layers/restcache.ts';
import {E, L} from '#src/internal/pure/effect.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {it} from '@effect/vitest';
import {pipe} from 'effect';
import {describe} from 'vitest';

describe('restcache', () => {
  const mockPut = vi.fn();
  const mockGet = vi.fn();
  const mockDDB = L.effect(DynamoDBDocument, E.sync(() => {
    return {
      get: mockGet,
      put: mockPut,
    } as any;
  }));

  it.effect(
    'thing', E.fn(
      function* () {
        mockPut.mockReturnValue(E.void);
        const restcache = yield* RestCache;
        yield* E.awaitAllChildren(restcache.set('test key', {}));
        expect(mockPut.mock.calls).toMatchInlineSnapshot(`
          [
            [
              {
                "Item": {
                  "_tag": "RestCacheData",
                  "data": {},
                  "pk": "RestCache",
                  "sk": "test key",
                  "ttl": 240000,
                },
                "TableName": "qual-dffp-clash-discord-bot-operations",
              },
            ],
          ]
        `);
      },
      E.provide(pipe(
        RestCache.Live,
        L.provide(mockDDB),
      )),
    ),
  );
});
