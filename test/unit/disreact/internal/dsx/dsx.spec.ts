import {OmniPublic} from '#src/discord/omni-board/omni-public.tsx';
import {encodeDsx} from '#src/disreact/internal/codec/dsx-encoder.ts';
import {dsx} from '#src/disreact/internal/dsx/index.ts';
import { __mallocnull} from '#src/disreact/internal/dsx/globals.ts';
import {initialRender} from '#src/disreact/internal/dsx/lifecycle.ts';
import type {Pragma} from '#src/disreact/internal/types.ts';
import {jsx} from '#src/disreact/interface/jsx-runtime.ts';

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
    __mallocnull();
    const rendered = initialRender(dsx(OmniPublic, {}) as Pragma);
    expect(encodeDsx(rendered)).toMatchInlineSnapshot(`
      [
        {
          "components": [
            {
              "components": [
                {
                  "emoji": undefined,
                  "label": "Start",
                  "style": 1,
                  "type": 2,
                },
                {
                  "emoji": {
                    "name": "ope",
                  },
                  "label": "Help",
                  "style": 6,
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
    expect(jsx(OmniPublic)).toMatchInlineSnapshot(`
      {
        "children": [],
        "id": "",
        "id_full": "",
        "id_step": "",
        "index": 0,
        "kind": "function",
        "name": "OmniPublic",
        "props": {},
        "render": [Function],
      }
    `);
  });
});
