/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-assignment */
import {OmniPublic} from '#src/discord/omni-board/omni-public.tsx';
import {__free, __mallocnull} from '#src/disreact/internal/globals.ts';
import {cloneTree, dispatchEvent, initialRender, rerenderRoot} from '#src/disreact/internal/lifecycle.ts';
import {jsx} from '#src/disreact/jsx-runtime.ts';



describe('lifecycle', () => {
  let given: any;

  beforeEach(() => {
    given = {};
    __mallocnull();
  });

  afterEach(() => {
    __free();
  });

  it('when cloning a node', () => {
    given.component = jsx(OmniPublic, {});
    const clone     = cloneTree(given.component);

    expect(clone).toEqual(given.component);
  });

  it('when cloning a tree', () => {
    given.component = jsx(OmniPublic, {});
    const rendered  = initialRender(given.component);
    const clone     = cloneTree(rendered);

    expect(clone).toEqual(rendered);
  });


  describe('given an initially rendered tree', () => {
    it('when rerendering the tree', () => {
      given.component = jsx(OmniPublic, {});
      given.initial   = initialRender(given.component);
      const actual    = rerenderRoot(given.initial);

      expect(JSON.stringify(actual, null, 2)).toEqual(JSON.stringify(given.initial, null, 2));
    });
  });

  describe('given an interaction event', () => {
    it('when dispatching an event', () => {
      given.component = jsx(OmniPublic, {});
      given.clone     = cloneTree(given.component);
      given.initial   = rerenderRoot(initialRender(given.clone));
      given.event     = {
        id  : 'buttons:1:button:0',
        type: 'onclick',
      } as any;

      const before     = cloneTree(given.initial);
      const actual     = dispatchEvent(given.initial, given.event);
      const rerendered = rerenderRoot(actual);

      expect(before.state.stack).toMatchInlineSnapshot(`
        [
          {
            "s": 0,
          },
        ]
      `);
      expect(rerendered.state.stack).toMatchInlineSnapshot(`
        [
          {
            "s": 1,
          },
        ]
      `);
    });


    describe('given event.id does not match any node.id', () => {
      beforeEach(() => {
        given.component = jsx(OmniPublic, {});
        given.clone     = cloneTree(given.component);
        given.initial   = rerenderRoot(initialRender(given.clone));
        given.event     = {
          id  : 'buttons:1:button:0',
          type: 'onclick',
        } as any;
        given.event.id  = 'never';
      });

      it('when dispatching an event', () => {
        const actual = () => dispatchEvent(given.initial, given.event);
        expect(actual).toThrowErrorMatchingInlineSnapshot(`[Error: No node with id_step "never" having a handler for type "onclick" was not found]`);
      });
    });


    describe('given event.type is not in any node.props', () => {
      it('when dispatching an event', () => {
        given.component  = jsx(OmniPublic, {});
        given.clone      = cloneTree(given.component);
        given.initial    = rerenderRoot(initialRender(given.clone));
        given.event      = {
          id  : 'buttons:1:button:0',
          type: 'onclick',
        } as any;
        given.event.type = 'never';
        const actual     = () => dispatchEvent(given.initial, given.event);
        expect(actual).toThrowErrorMatchingInlineSnapshot(`[Error: No node with id_step "buttons:1:button:0" having a handler for type "never" was not found]`);
      });
    });
  });


  it('when rendering an initial tree', () => {
    given.component = jsx(OmniPublic, {});
    const clone     = cloneTree(given.component);
    const render    = initialRender(clone);

    expect(JSON.stringify(render, null, 2)).toMatchInlineSnapshot(`
      "{
        "kind": "function",
        "name": "OmniPublic",
        "index": 0,
        "id": "OmniPublic:0",
        "id_step": "OmniPublic:0",
        "id_full": "OmniPublic:0",
        "props": {},
        "isRoot": true,
        "children": [
          {
            "kind": "intrinsic",
            "name": "message",
            "index": 0,
            "id": "message:0",
            "id_step": "OmniPublic:0:message:0",
            "id_full": "OmniPublic:0:message:0",
            "props": {
              "public": true
            },
            "children": [
              {
                "kind": "function",
                "name": "Header",
                "index": 0,
                "id": "Header:0",
                "id_step": "message:0:Header:0",
                "id_full": "OmniPublic:0:message:0:Header:0",
                "props": {
                  "title": "Omni Board",
                  "description": "V2 - JSX Pragma"
                },
                "children": [
                  {
                    "kind": "intrinsic",
                    "name": "embed",
                    "index": 0,
                    "id": "embed:0",
                    "id_step": "Header:0:embed:0",
                    "id_full": "OmniPublic:0:message:0:Header:0:embed:0",
                    "props": {},
                    "children": [
                      {
                        "kind": "intrinsic",
                        "name": "title",
                        "index": 0,
                        "id": "title:0",
                        "id_step": "embed:0:title:0",
                        "id_full": "OmniPublic:0:message:0:Header:0:embed:0:title:0",
                        "props": {},
                        "children": [
                          {
                            "kind": "text",
                            "name": "string",
                            "id_step": "title:0:string:0",
                            "id_full": "OmniPublic:0:message:0:Header:0:embed:0:title:0:string:0",
                            "value": "Omni Board",
                            "index": 0,
                            "id": "string:0"
                          }
                        ]
                      },
                      {
                        "kind": "intrinsic",
                        "name": "description",
                        "index": 1,
                        "id": "description:1",
                        "id_step": "embed:0:description:1",
                        "id_full": "OmniPublic:0:message:0:Header:0:embed:0:description:1",
                        "props": {},
                        "children": [
                          {
                            "kind": "text",
                            "name": "string",
                            "id_step": "description:1:string:0",
                            "id_full": "OmniPublic:0:message:0:Header:0:embed:0:description:1:string:0",
                            "value": "V2 - JSX Pragma",
                            "index": 0,
                            "id": "string:0"
                          }
                        ]
                      }
                    ]
                  }
                ],
                "state": {
                  "id": "OmniPublic:0:message:0:Header:0",
                  "pc": 0,
                  "stack": [],
                  "sync": [],
                  "async": [],
                  "rc": 1,
                  "nextpage": null
                },
                "stack": []
              },
              {
                "kind": "intrinsic",
                "name": "buttons",
                "index": 1,
                "id": "buttons:1",
                "id_step": "message:0:buttons:1",
                "id_full": "OmniPublic:0:message:0:buttons:1",
                "props": {},
                "children": [
                  {
                    "kind": "intrinsic",
                    "name": "button",
                    "index": 0,
                    "id": "button:0",
                    "id_step": "buttons:1:button:0",
                    "id_full": "OmniPublic:0:message:0:buttons:1:button:0",
                    "props": {
                      "primary": true,
                      "label": "Start"
                    },
                    "children": []
                  },
                  {
                    "kind": "intrinsic",
                    "name": "button",
                    "index": 1,
                    "id": "button:1",
                    "id_step": "buttons:1:button:1",
                    "id_full": "OmniPublic:0:message:0:buttons:1:button:1",
                    "props": {
                      "secondary": true,
                      "label": "Help"
                    },
                    "children": [
                      {
                        "kind": "intrinsic",
                        "name": "emoji",
                        "index": 0,
                        "id": "emoji:0",
                        "id_step": "button:1:emoji:0",
                        "id_full": "OmniPublic:0:message:0:buttons:1:button:1:emoji:0",
                        "props": {
                          "name": "ope"
                        },
                        "children": []
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ],
        "state": {
          "id": "OmniPublic:0",
          "pc": 0,
          "stack": [
            {
              "s": 0
            }
          ],
          "sync": [],
          "async": [],
          "rc": 1,
          "nextpage": null
        },
        "stack": [
          {
            "s": 0
          }
        ]
      }"
    `);
  });
});
