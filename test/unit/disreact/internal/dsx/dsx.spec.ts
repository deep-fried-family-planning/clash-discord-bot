import {OmniPublic} from '#src/discord/omni-board/omni-public.tsx';
import {dsx} from '#src/disreact/internal/dsx/index.ts';
import {dsxencode} from '#src/disreact/internal/encode.ts';
import { __mallocnull} from '#src/disreact/internal/globals.ts';
import {initialRender} from '#src/disreact/internal/lifecycle.ts';
import type {Pragma} from '#src/disreact/internal/types.ts';
import {jsx} from '#src/disreact/jsx-runtime.ts';

describe('pragma', () => {
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
    expect(dsxencode(rendered)).toMatchInlineSnapshot(`
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
