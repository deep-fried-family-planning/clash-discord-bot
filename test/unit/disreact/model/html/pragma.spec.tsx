import {OmniPublic} from '#src/discord/omni-board/omni-public.tsx';
import {dsxencode} from '#src/disreact/dsx/pragma-encoder.ts';
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
    expect(dsxencode(<OmniPublic/>)).toMatchInlineSnapshot(`
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
                          {
                            "id": "string:0",
                            "id_full": "",
                            "id_step": "",
                            "index": 0,
                            "kind": "text",
                            "name": "string",
                            "value": "Omni Board",
                          },
                        ],
                        "id": "title:0",
                        "id_full": "",
                        "id_step": "",
                        "index": 0,
                        "kind": "intrinsic",
                        "name": "title",
                        "props": {},
                      },
                      {
                        "children": [
                          {
                            "id": "string:0",
                            "id_full": "",
                            "id_step": "",
                            "index": 0,
                            "kind": "text",
                            "name": "string",
                            "value": "V2 - JSX Pragma",
                          },
                        ],
                        "id": "description:1",
                        "id_full": "",
                        "id_step": "",
                        "index": 1,
                        "kind": "intrinsic",
                        "name": "description",
                        "props": {},
                      },
                    ],
                    "id": "embed:0",
                    "id_full": "",
                    "id_step": "",
                    "index": 0,
                    "kind": "intrinsic",
                    "name": "embed",
                    "props": {},
                  },
                ],
                "id": "Header:0",
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
                    "id": "button:0",
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
                        "id": "emoji:0",
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
                    "id": "button:1",
                    "id_full": "",
                    "id_step": "",
                    "index": 1,
                    "kind": "intrinsic",
                    "name": "button",
                    "props": {
                      "label": "Help",
                      "secondary": true,
                    },
                  },
                ],
                "id": "buttons:1",
                "id_full": "",
                "id_step": "",
                "index": 1,
                "kind": "intrinsic",
                "name": "buttons",
                "props": {},
              },
            ],
            "id": "message:0",
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
