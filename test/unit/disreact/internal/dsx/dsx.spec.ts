import {jsx} from '#src/disreact/interface/jsx-runtime.ts';
import {encodeDsx} from '#src/disreact/internal/codec/dsx-encoder.ts';
import {HookDispatch} from '#src/disreact/internal/hooks/HookDispatch.ts';
import {dsx} from '#src/disreact/internal/dsx/index.ts';
import {initialRender} from '#src/disreact/internal/dsx/lifecycle.ts';
import type {Pragma} from '#src/disreact/internal/types.ts';
import {TestMessage} from 'test/unit/disreact/internal/dsx/.components/test-message.tsx';

describe('dsx', () => {
  it('renders intrinsic', () => {
    expect(jsx('embed')).toMatchInlineSnapshot(`
      {
        "children": [],
        "id": "",
        "id_full": "",
        "id_step": "",
        "index": 0,
        "kind": "intrinsic",
        "name": "embed",
        "props": {},
      }
    `);
  });

  it('encodes message', () => {
    HookDispatch.__mallocnull();
    const rendered = initialRender(jsx(TestMessage, {}) as Pragma);
    expect(encodeDsx(rendered)).toMatchInlineSnapshot(`
      [
        {
          "components": [
            {
              "components": [
                {
                  "custom_id": "buttons:1:button:0",
                  "emoji": undefined,
                  "label": "Start",
                  "style": 1,
                  "type": 2,
                },
                {
                  "custom_id": "buttons:1:button:1",
                  "emoji": {
                    "name": "ope",
                  },
                  "label": "Help",
                  "style": 2,
                  "type": 2,
                },
              ],
              "type": 1,
            },
          ],
          "embeds": [
            {
              "description": "V2 - JSX Pragma",
              "title": "Omni Board",
            },
          ],
          "flags": undefined,
          "public": true,
        },
      ]
    `);
  });

  it('renders tree', () => {
    expect(jsx(TestMessage)).toMatchInlineSnapshot(`
      {
        "children": [],
        "id": "",
        "id_full": "",
        "id_step": "",
        "index": 0,
        "kind": "function",
        "name": "TestMessage",
        "props": {},
        "render": [Function],
      }
    `);
  });
});
