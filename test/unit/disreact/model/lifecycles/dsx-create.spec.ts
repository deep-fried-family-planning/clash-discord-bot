import {jsx} from '#src/disreact/jsx-runtime.ts';
import {encodeDsx} from '#src/disreact/model/lifecycles/dsx-encode.ts';
import {HookDispatch} from '#src/disreact/model/HookDispatch.ts';
import {initialRender, type Pragma} from '#src/disreact/model/lifecycle.ts';
import {E} from '#src/internal/pure/effect.ts';
import {TestMessage} from 'test/unit/disreact/model/.components/test-message.tsx';
import {it} from '@effect/vitest';



describe('dsx', () => {
  it('renders intrinsic', () => {
    expect(jsx('embed')).toMatchInlineSnapshot(`
      {
        "_name": "embed",
        "_tag": "IntrinsicElement",
        "children": [],
        "meta": {
          "full_id": "",
          "id": ".not-set",
          "idx": 0,
          "step_id": "",
        },
        "props": {},
      }
    `);
  });

  it.effect('encodes message', E.fn(function * () {
    HookDispatch.__mallocnull();
    const rendered = yield *  initialRender(jsx(TestMessage, {}) as Pragma);
    expect(encodeDsx(rendered)).toMatchInlineSnapshot(`
      [
        {
          "components": [
            {
              "components": [
                {
                  "custom_id": "actions:2:button:0",
                  "emoji": undefined,
                  "label": "Start",
                  "style": 1,
                  "type": 2,
                },
                {
                  "custom_id": "actions:2:secondary:1",
                  "label": "Help",
                  "style": 2,
                  "type": 2,
                },
              ],
              "type": 1,
            },
            {
              "components": [
                {
                  "options": [
                    {
                      "label": "1",
                      "value": "1",
                    },
                    {
                      "label": "2",
                      "value": "2",
                    },
                    {
                      "default": true,
                      "label": "3",
                      "value": "3",
                    },
                  ],
                  "type": 3,
                },
              ],
              "type": 1,
            },
          ],
          "embeds": [
            {
              "description": "V2 - JSX Pragma",
              "fields": undefined,
              "footer": undefined,
              "title": "Omni Board",
            },
            {
              "description": "
      ### H3
      -#  welcome!
      __$not a link__",
              "fields": undefined,
              "footer": undefined,
              "title": "Test Title - NOT markdown",
            },
          ],
          "flags": undefined,
          "public": true,
        },
      ]
    `);
  }));

  it('renders tree', () => {
    expect(jsx(TestMessage)).toMatchInlineSnapshot(`
      {
        "_kind": "SyncOrEffect",
        "_name": "TestMessage",
        "_tag": "FunctionElement",
        "children": [],
        "meta": {
          "full_id": "",
          "graphName": ".not-set",
          "id": ".not-set",
          "idx": 0,
          "isModal": undefined,
          "isRoot": undefined,
          "step_id": "",
        },
        "props": {},
        "render": [Function],
        "state": {
          "circular": {
            "node": null,
            "refs": [],
          },
          "pc": 0,
          "prior": [],
          "queue": [],
          "rc": 0,
          "stack": [],
        },
      }
    `);
  });
});
