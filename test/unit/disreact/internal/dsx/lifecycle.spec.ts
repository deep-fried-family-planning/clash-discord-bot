
import {jsx} from '#src/disreact/jsx-runtime.ts';
import {HookDispatch} from '#src/disreact/model/HookDispatch.ts';
import {cloneTree, collectStates, dispatchEvent, hydrateRoot, initialRender, type Pragma, reduceToStacks, rerenderRoot} from '#src/disreact/model/lifecycle.ts';
import {E} from '#src/internal/pure/effect.ts';
import {TestMessage} from 'test/unit/disreact/internal/dsx/.components/test-message.tsx';
import {it} from '@effect/vitest';


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

  it.live('when cloning a tree', E.fn(function * () {
    given.component = jsx(TestMessage, {});
    const rendered  = yield * initialRender(given.component);
    const clone     = cloneTree(rendered);

    expect(clone).toEqual(rendered);
  }));

  it.live('when rerendering', E.fn(function * () {
    given.component = jsx(TestMessage, {});
    given.initial   = yield * initialRender(given.component);
    const actual    = yield * rerenderRoot(given.initial);

    expect(nofunc(actual)).toEqual(nofunc(given.initial));
  }));

  describe('given empty hydration state', () => {
    it('when hydrating a root', E.fn(function * () {
      given.component = jsx(TestMessage, {});
      given.clone     = cloneTree(given.component);

      const expected = initialRender(given.component);
      const actual   = hydrateRoot(given.clone, {});

      expect(nofunc(actual)).toStrictEqual(nofunc(expected));
    }));
  });

  describe('given an interaction event', () => {
    it('when dispatching an event', E.fn(function * () {
      given.component = jsx(TestMessage, {});
      given.clone     = yield * cloneTree(given.component);
      given.initial   = yield * rerenderRoot(yield * initialRender(given.clone));
      given.event     = {
        id  : 'buttons:1:button:0',
        type: 'onclick',
      } as any;

      const before     = cloneTree(given.initial);
      const actual     = dispatchEvent(given.initial, given.event);
      const rerendered = yield * rerenderRoot(actual);

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
    }));


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


  it.live('when rendering an initial tree', E.fn(function * () {
    given.component = jsx(TestMessage, {});
    const clone     = cloneTree(given.component);
    const render    = yield * initialRender(clone);

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
                "name": "embed",
                "index": 1,
                "id": "embed:1",
                "id_step": "message:0:embed:1",
                "id_full": "TestMessage:0:message:0:embed:1",
                "props": {},
                "children": [
                  {
                    "kind": "intrinsic",
                    "name": "title",
                    "index": 0,
                    "id": "title:0",
                    "id_step": "embed:1:title:0",
                    "id_full": "TestMessage:0:message:0:embed:1:title:0",
                    "props": {},
                    "children": [
                      {
                        "kind": "text",
                        "name": "string",
                        "id_step": "title:0:string:0",
                        "id_full": "TestMessage:0:message:0:embed:1:title:0:string:0",
                        "value": "Test Title - NOT markdown",
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
                    "id_step": "embed:1:description:1",
                    "id_full": "TestMessage:0:message:0:embed:1:description:1",
                    "props": {},
                    "children": [
                      {
                        "kind": "intrinsic",
                        "name": "h3",
                        "index": 0,
                        "id": "h3:0",
                        "id_step": "description:1:h3:0",
                        "id_full": "TestMessage:0:message:0:embed:1:description:1:h3:0",
                        "props": {},
                        "children": [
                          {
                            "kind": "text",
                            "name": "string",
                            "id_step": "h3:0:string:0",
                            "id_full": "TestMessage:0:message:0:embed:1:description:1:h3:0:string:0",
                            "value": "H3",
                            "index": 0,
                            "id": "string:0"
                          }
                        ]
                      },
                      {
                        "kind": "intrinsic",
                        "name": "small",
                        "index": 1,
                        "id": "small:1",
                        "id_step": "description:1:small:1",
                        "id_full": "TestMessage:0:message:0:embed:1:description:1:small:1",
                        "props": {},
                        "children": [
                          {
                            "kind": "intrinsic",
                            "name": "p",
                            "index": 0,
                            "id": "p:0",
                            "id_step": "small:1:p:0",
                            "id_full": "TestMessage:0:message:0:embed:1:description:1:small:1:p:0",
                            "props": {},
                            "children": [
                              {
                                "kind": "intrinsic",
                                "name": "at",
                                "index": 0,
                                "id": "at:0",
                                "id_step": "p:0:at:0",
                                "id_full": "TestMessage:0:message:0:embed:1:description:1:small:1:p:0:at:0",
                                "props": {
                                  "user": true,
                                  "id": "123456"
                                },
                                "children": []
                              },
                              {
                                "kind": "text",
                                "name": "string",
                                "id_step": "p:0:string:1",
                                "id_full": "TestMessage:0:message:0:embed:1:description:1:small:1:p:0:string:1",
                                "value": "welcome!",
                                "index": 1,
                                "id": "string:1"
                              }
                            ]
                          }
                        ]
                      },
                      {
                        "kind": "intrinsic",
                        "name": "br",
                        "index": 2,
                        "id": "br:2",
                        "id_step": "description:1:br:2",
                        "id_full": "TestMessage:0:message:0:embed:1:description:1:br:2",
                        "props": {},
                        "children": []
                      },
                      {
                        "kind": "intrinsic",
                        "name": "u",
                        "index": 3,
                        "id": "u:3",
                        "id_step": "description:1:u:3",
                        "id_full": "TestMessage:0:message:0:embed:1:description:1:u:3",
                        "props": {},
                        "children": [
                          {
                            "kind": "text",
                            "name": "string",
                            "id_step": "u:3:string:0",
                            "id_full": "TestMessage:0:message:0:embed:1:description:1:u:3:string:0",
                            "value": "$",
                            "index": 0,
                            "id": "string:0"
                          },
                          {
                            "kind": "text",
                            "name": "string",
                            "id_step": "u:3:string:1",
                            "id_full": "TestMessage:0:message:0:embed:1:description:1:u:3:string:1",
                            "value": "not a link",
                            "index": 1,
                            "id": "string:1"
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                "kind": "intrinsic",
                "name": "buttons",
                "index": 2,
                "id": "buttons:2",
                "id_step": "message:0:buttons:2",
                "id_full": "TestMessage:0:message:0:buttons:2",
                "props": {},
                "children": [
                  {
                    "kind": "intrinsic",
                    "name": "button",
                    "index": 0,
                    "id": "button:0",
                    "id_step": "buttons:2:button:0",
                    "id_full": "TestMessage:0:message:0:buttons:2:button:0",
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
                    "id_step": "buttons:2:button:1",
                    "id_full": "TestMessage:0:message:0:buttons:2:button:1",
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
                        "id_full": "TestMessage:0:message:0:buttons:2:button:1:emoji:0",
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
  }));
});
