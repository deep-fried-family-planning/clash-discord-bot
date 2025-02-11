/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-assignment */
import {jsx} from '#src/disreact/interface/jsx-runtime.ts';
import {HookDispatch} from '#src/disreact/internal/hooks/HookDispatch.ts';
import {cloneTree, collectStates, dispatchEvent, hydrateRoot, initialRender, reduceToStacks, rerenderRoot} from '#src/disreact/internal/dsx/lifecycle.ts';
import type {Pragma} from '#src/disreact/internal/dsx/types.ts';
import {TestMessage} from 'test/unit/disreact/internal/dsx/.components/test-message.tsx';



const nofunc = (node: Pragma): Pragma => {
  if ('props' in node && node.props && typeof node.props === 'object') {
    delete node.props['onclick'];
  }

  if ('children' in node && node.children.length > 0) {
    node.children = node.children.map((child) => nofunc(child));
  }

  return node;
};



describe('lifecycle', () => {
  let given: any;

  beforeEach(() => {
    given = {};
    HookDispatch.__mallocnull();
  });

  afterEach(HookDispatch.__free);

  it('when cloning a node', () => {
    given.component = jsx(TestMessage, {});
    const clone     = cloneTree(given.component);

    expect(clone).toEqual(given.component);
  });

  it('when cloning a tree', () => {
    given.component = jsx(TestMessage, {});
    const rendered  = initialRender(given.component);
    const clone     = cloneTree(rendered);

    expect(clone).toEqual(rendered);
  });

  it('when rerendering', () => {
    given.component = jsx(TestMessage, {});
    given.initial   = initialRender(given.component);
    const actual    = rerenderRoot(given.initial);

    expect(nofunc(actual)).toEqual(nofunc(given.initial));
  });

  describe('given empty hydration state', () => {
    it('when hydrating a root', () => {
      given.component = jsx(TestMessage, {});
      given.clone     = cloneTree(given.component);

      const expected = initialRender(given.component);
      const actual   = hydrateRoot(given.clone, {});

      expect(nofunc(actual)).toStrictEqual(nofunc(expected));
    });
  });

  describe('given an interaction event', () => {
    it('when dispatching an event', () => {
      given.component = jsx(TestMessage, {});
      given.clone     = cloneTree(given.component);
      given.initial   = rerenderRoot(initialRender(given.clone));
      given.event     = {
        id  : 'buttons:1:button:0',
        type: 'onclick',
      } as any;

      const before     = cloneTree(given.initial);
      const actual     = dispatchEvent(given.initial, given.event);
      const rerendered = rerenderRoot(actual);

      const beforeStacks = reduceToStacks(collectStates(before));
      const actualStacks = reduceToStacks(collectStates(rerendered));

      expect(beforeStacks).toMatchInlineSnapshot(`
        {
          "TestMessage:0": [
            {
              "s": 0,
            },
          ],
        }
      `);
      expect(actualStacks).toMatchInlineSnapshot(`
        {
          "TestMessage:0": [
            {
              "s": 1,
            },
          ],
        }
      `);
    });


    describe('given event.id does not match any node.id', () => {
      beforeEach(() => {
        given.component = jsx(TestMessage, {});
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
        expect(actual).toThrowErrorMatchingInlineSnapshot(`[DisReact.Critical]`);
      });
    });


    describe('given event.type is not in any node.props', () => {
      it('when dispatching an event', () => {
        given.component  = jsx(TestMessage, {});
        given.clone      = cloneTree(given.component);
        given.initial    = rerenderRoot(initialRender(given.clone));
        given.event      = {
          id  : 'buttons:1:button:0',
          type: 'onclick',
        } as any;
        given.event.type = 'never';
        const actual     = () => dispatchEvent(given.initial, given.event);
        expect(actual).toThrowErrorMatchingInlineSnapshot(`[DisReact.Critical]`);
      });
    });
  });


  it('when rendering an initial tree', () => {
    given.component = jsx(TestMessage, {});
    const clone     = cloneTree(given.component);
    const render    = initialRender(clone);

    expect(JSON.stringify(render, null, 2)).toMatchInlineSnapshot(`
      "{
        "kind": "function",
        "name": "TestMessage",
        "index": 0,
        "id": "TestMessage:0",
        "id_step": "TestMessage:0",
        "id_full": "TestMessage:0",
        "props": {},
        "isRoot": true,
        "children": [
          {
            "kind": "intrinsic",
            "name": "message",
            "index": 0,
            "id": "message:0",
            "id_step": "TestMessage:0:message:0",
            "id_full": "TestMessage:0:message:0",
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
                "id_full": "TestMessage:0:message:0:Header:0",
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
                    "id_full": "TestMessage:0:message:0:Header:0:embed:0",
                    "props": {},
                    "children": [
                      {
                        "kind": "intrinsic",
                        "name": "title",
                        "index": 0,
                        "id": "title:0",
                        "id_step": "embed:0:title:0",
                        "id_full": "TestMessage:0:message:0:Header:0:embed:0:title:0",
                        "props": {},
                        "children": [
                          {
                            "kind": "text",
                            "name": "string",
                            "id_step": "title:0:string:0",
                            "id_full": "TestMessage:0:message:0:Header:0:embed:0:title:0:string:0",
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
                        "id_full": "TestMessage:0:message:0:Header:0:embed:0:description:1",
                        "props": {},
                        "children": [
                          {
                            "kind": "text",
                            "name": "string",
                            "id_step": "description:1:string:0",
                            "id_full": "TestMessage:0:message:0:Header:0:embed:0:description:1:string:0",
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
                  "id": "TestMessage:0:message:0:Header:0",
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
                "id_full": "TestMessage:0:message:0:buttons:1",
                "props": {},
                "children": [
                  {
                    "kind": "intrinsic",
                    "name": "button",
                    "index": 0,
                    "id": "button:0",
                    "id_step": "buttons:1:button:0",
                    "id_full": "TestMessage:0:message:0:buttons:1:button:0",
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
                    "id_full": "TestMessage:0:message:0:buttons:1:button:1",
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
                        "id_full": "TestMessage:0:message:0:buttons:1:button:1:emoji:0",
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
          "id": "TestMessage:0",
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
        ],
        "isMessage": true
      }"
    `);
  });
});
