import {encodeDsx} from '#src/disreact/codec/dsx/element-encode.ts';
import type * as Element from '#src/disreact/codec/element/index.ts';
import {jsx} from '#src/disreact/jsx-runtime.ts';
import * as Globals from '#src/disreact/model/lifecycles/globals.ts';
import * as Lifecycles from '#src/disreact/model/lifecycles/index.ts';
import {E} from '#src/internal/pure/effect.ts';
import {it} from '@effect/vitest';
import {TestMessage} from 'test/unit/disreact/model/.components/test-message.tsx';



describe('dsx', () => {
  it('renders intrinsic', () => {
    expect(jsx('embed')).toMatchInlineSnapshot(`
      {
        "_name": "embed",
        "_tag": "IntrinsicElement",
        "children": [],
        "meta": {
          "full_id": "",
          "id": "",
          "idx": 0,
          "step_id": "",
        },
        "props": {},
      }
    `);
  });

  it.effect('encodes message', E.fn(function* () {
    const Null = Globals.nullifyPointer();
    Globals.mountRoot(Null);

    const rendered = yield* Lifecycles.initialRender(jsx(TestMessage, {}) as Element.T);
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
                  "custom_id": "message:0:select:3",
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
    Globals.dismountRoot();
    Globals.unsetPointer();
  }));

  it('renders tree', () => {
    expect(jsx(TestMessage)).toMatchInlineSnapshot(`
      {
        "_name": "TestMessage",
        "_tag": "FunctionElement",
        "children": [],
        "meta": {
          "full_id": "",
          "id": "",
          "idx": 0,
          "step_id": "",
        },
        "props": {},
        "render": [Function],
        "state": {
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
