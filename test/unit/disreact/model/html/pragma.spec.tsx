import {OmniPublic} from '#src/discord/omni-board/omni-public.tsx';
import {_jsxe} from '#src/disreact/dsx/pragma-encoder.ts';
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
    expect(_jsxe(<OmniPublic/>)).toMatchInlineSnapshot(`
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
        "children": [
          {
            "children": [
              {
                "children": [
                  {
                    "children": [
                      {
                        "children": [
                          "Omni Board",
                        ],
                        "id": "",
                        "id_full": "",
                        "id_step": "",
                        "index": 0,
                        "kind": "intrinsic",
                        "name": "title",
                        "props": {},
                      },
                      {
                        "children": [
                          "V2 - JSX Pragma",
                        ],
                        "id": "",
                        "id_full": "",
                        "id_step": "",
                        "index": 0,
                        "kind": "intrinsic",
                        "name": "description",
                        "props": {},
                      },
                    ],
                    "id": "",
                    "id_full": "",
                    "id_step": "",
                    "index": 0,
                    "kind": "intrinsic",
                    "name": "embed",
                    "props": {},
                  },
                ],
                "id": "",
                "id_full": "",
                "id_step": "",
                "index": 0,
                "kind": "function",
                "name": "Header",
                "props": {
                  "description": "V2 - JSX Pragma",
                  "title": "Omni Board",
                },
                "render": [Function],
              },
              {
                "children": [
                  {
                    "children": [],
                    "id": "",
                    "id_full": "",
                    "id_step": "",
                    "index": 0,
                    "kind": "intrinsic",
                    "name": "button",
                    "props": {
                      "label": "Start",
                      "primary": true,
                    },
                  },
                  {
                    "children": [
                      {
                        "children": [],
                        "id": "",
                        "id_full": "",
                        "id_step": "",
                        "index": 0,
                        "kind": "intrinsic",
                        "name": "emoji",
                        "props": {
                          "name": "ope",
                        },
                      },
                    ],
                    "id": "",
                    "id_full": "",
                    "id_step": "",
                    "index": 0,
                    "kind": "intrinsic",
                    "name": "button",
                    "props": {
                      "label": "Help",
                      "secondary": true,
                    },
                  },
                ],
                "id": "",
                "id_full": "",
                "id_step": "",
                "index": 0,
                "kind": "intrinsic",
                "name": "buttons",
                "props": {},
              },
            ],
            "id": "",
            "id_full": "",
            "id_step": "",
            "index": 0,
            "kind": "intrinsic",
            "name": "message",
            "props": {
              "public": true,
            },
          },
        ],
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
