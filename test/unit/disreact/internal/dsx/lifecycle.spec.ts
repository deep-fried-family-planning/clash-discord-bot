
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
        expect(actual).toThrowErrorMatchingInlineSnapshot(`[Error: No node with id_step "never" having a handler for type "onclick" was not found]`);
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
        expect(actual).toThrowErrorMatchingInlineSnapshot(`[Error: No node with id_step "buttons:1:button:0" having a handler for type "never" was not found]`);
      });
    });
  });


  it.live('when rendering an initial tree', E.fn(function * () {
    given.component = jsx(TestMessage, {});
    const clone     = cloneTree(given.component);
    const render    = yield * initialRender(clone);

    expect(JSON.stringify(render, null, 2)).toMatchInlineSnapshot(`
      "{
        "_kind": "SyncOrEffect",
        "_tag": "FunctionElement",
        "_name": "TestMessage",
        "meta": {
          "idx": 0,
          "id": "TestMessage:0",
          "step_id": "TestMessage:0",
          "full_id": "TestMessage:0",
          "isRoot": true,
          "graphName": ".not-set"
        },
        "state": {
          "pc": 0,
          "stack": [
            {
              "s": 0
            }
          ],
          "prior": [
            {
              "s": 0
            }
          ],
          "rc": 1,
          "circular": {
            "node": null,
            "refs": []
          },
          "queue": []
        },
        "props": {},
        "children": [
          {
            "_tag": "IntrinsicElement",
            "_name": "message",
            "meta": {
              "id": "message:0",
              "idx": 0,
              "step_id": "TestMessage:0:message:0",
              "full_id": "TestMessage:0:message:0"
            },
            "props": {
              "public": true
            },
            "children": [
              {
                "_kind": "SyncOrEffect",
                "_tag": "FunctionElement",
                "_name": "Header",
                "meta": {
                  "idx": 0,
                  "id": "Header:0",
                  "step_id": "message:0:Header:0",
                  "full_id": "TestMessage:0:message:0:Header:0",
                  "graphName": ".not-set"
                },
                "props": {
                  "title": "Omni Board",
                  "description": "V2 - JSX Pragma"
                },
                "state": {
                  "pc": 0,
                  "stack": [],
                  "prior": [],
                  "rc": 1,
                  "queue": [],
                  "circular": {
                    "node": null,
                    "refs": []
                  }
                },
                "children": [
                  {
                    "_tag": "IntrinsicElement",
                    "_name": "embed",
                    "meta": {
                      "id": "embed:0",
                      "idx": 0,
                      "step_id": "Header:0:embed:0",
                      "full_id": "TestMessage:0:message:0:Header:0:embed:0"
                    },
                    "props": {
                      "title": "Omni Board"
                    },
                    "children": [
                      {
                        "_tag": "TextElement",
                        "_name": "string",
                        "meta": {
                          "id": "string:0",
                          "idx": 0,
                          "step_id": "embed:0:string:0",
                          "full_id": "TestMessage:0:message:0:Header:0:embed:0:string:0"
                        },
                        "value": "V2 - JSX Pragma",
                        "props": {},
                        "children": []
                      }
                    ]
                  }
                ]
              },
              {
                "_tag": "IntrinsicElement",
                "_name": "embed",
                "meta": {
                  "id": "embed:1",
                  "idx": 1,
                  "step_id": "message:0:embed:1",
                  "full_id": "TestMessage:0:message:0:embed:1"
                },
                "props": {
                  "title": "Test Title - NOT markdown"
                },
                "children": [
                  {
                    "_tag": "IntrinsicElement",
                    "_name": "h3",
                    "meta": {
                      "id": "h3:0",
                      "idx": 0,
                      "step_id": "embed:1:h3:0",
                      "full_id": "TestMessage:0:message:0:embed:1:h3:0"
                    },
                    "props": {},
                    "children": [
                      {
                        "_tag": "TextElement",
                        "_name": "string",
                        "meta": {
                          "id": "string:0",
                          "idx": 0,
                          "step_id": "h3:0:string:0",
                          "full_id": "TestMessage:0:message:0:embed:1:h3:0:string:0"
                        },
                        "value": "H3",
                        "props": {},
                        "children": []
                      }
                    ]
                  },
                  {
                    "_tag": "IntrinsicElement",
                    "_name": "small",
                    "meta": {
                      "id": "small:1",
                      "idx": 1,
                      "step_id": "embed:1:small:1",
                      "full_id": "TestMessage:0:message:0:embed:1:small:1"
                    },
                    "props": {},
                    "children": [
                      {
                        "_tag": "IntrinsicElement",
                        "_name": "p",
                        "meta": {
                          "id": "p:0",
                          "idx": 0,
                          "step_id": "small:1:p:0",
                          "full_id": "TestMessage:0:message:0:embed:1:small:1:p:0"
                        },
                        "props": {},
                        "children": [
                          {
                            "_tag": "IntrinsicElement",
                            "_name": "at",
                            "meta": {
                              "id": "at:0",
                              "idx": 0,
                              "step_id": "p:0:at:0",
                              "full_id": "TestMessage:0:message:0:embed:1:small:1:p:0:at:0"
                            },
                            "props": {
                              "user": "123456"
                            },
                            "children": []
                          },
                          {
                            "_tag": "TextElement",
                            "_name": "string",
                            "meta": {
                              "id": "string:1",
                              "idx": 1,
                              "step_id": "p:0:string:1",
                              "full_id": "TestMessage:0:message:0:embed:1:small:1:p:0:string:1"
                            },
                            "value": "welcome!",
                            "props": {},
                            "children": []
                          }
                        ]
                      }
                    ]
                  },
                  {
                    "_tag": "IntrinsicElement",
                    "_name": "br",
                    "meta": {
                      "id": "br:2",
                      "idx": 2,
                      "step_id": "embed:1:br:2",
                      "full_id": "TestMessage:0:message:0:embed:1:br:2"
                    },
                    "props": {},
                    "children": []
                  },
                  {
                    "_tag": "IntrinsicElement",
                    "_name": "u",
                    "meta": {
                      "id": "u:3",
                      "idx": 3,
                      "step_id": "embed:1:u:3",
                      "full_id": "TestMessage:0:message:0:embed:1:u:3"
                    },
                    "props": {},
                    "children": [
                      {
                        "_tag": "TextElement",
                        "_name": "string",
                        "meta": {
                          "id": "string:0",
                          "idx": 0,
                          "step_id": "u:3:string:0",
                          "full_id": "TestMessage:0:message:0:embed:1:u:3:string:0"
                        },
                        "value": "$",
                        "props": {},
                        "children": []
                      },
                      {
                        "_tag": "TextElement",
                        "_name": "string",
                        "meta": {
                          "id": "string:1",
                          "idx": 1,
                          "step_id": "u:3:string:1",
                          "full_id": "TestMessage:0:message:0:embed:1:u:3:string:1"
                        },
                        "value": "not a link",
                        "props": {},
                        "children": []
                      }
                    ]
                  }
                ]
              },
              {
                "_tag": "IntrinsicElement",
                "_name": "actions",
                "meta": {
                  "id": "actions:2",
                  "idx": 2,
                  "step_id": "message:0:actions:2",
                  "full_id": "TestMessage:0:message:0:actions:2"
                },
                "props": {},
                "children": [
                  {
                    "_tag": "IntrinsicElement",
                    "_name": "button",
                    "meta": {
                      "id": "button:0",
                      "idx": 0,
                      "step_id": "actions:2:button:0",
                      "full_id": "TestMessage:0:message:0:actions:2:button:0"
                    },
                    "props": {
                      "primary": true,
                      "label": "Start"
                    },
                    "children": []
                  },
                  {
                    "_tag": "IntrinsicElement",
                    "_name": "secondary",
                    "meta": {
                      "id": "secondary:1",
                      "idx": 1,
                      "step_id": "actions:2:secondary:1",
                      "full_id": "TestMessage:0:message:0:actions:2:secondary:1"
                    },
                    "props": {
                      "label": "Help"
                    },
                    "children": []
                  }
                ]
              },
              {
                "_tag": "IntrinsicElement",
                "_name": "select",
                "meta": {
                  "id": "select:3",
                  "idx": 3,
                  "step_id": "message:0:select:3",
                  "full_id": "TestMessage:0:message:0:select:3"
                },
                "props": {},
                "children": [
                  {
                    "_tag": "IntrinsicElement",
                    "_name": "option",
                    "meta": {
                      "id": "option:0",
                      "idx": 0,
                      "step_id": "select:3:option:0",
                      "full_id": "TestMessage:0:message:0:select:3:option:0"
                    },
                    "props": {
                      "value": "1",
                      "label": "1"
                    },
                    "children": []
                  },
                  {
                    "_tag": "IntrinsicElement",
                    "_name": "option",
                    "meta": {
                      "id": "option:1",
                      "idx": 1,
                      "step_id": "select:3:option:1",
                      "full_id": "TestMessage:0:message:0:select:3:option:1"
                    },
                    "props": {
                      "value": "2",
                      "label": "2"
                    },
                    "children": []
                  },
                  {
                    "_tag": "IntrinsicElement",
                    "_name": "option",
                    "meta": {
                      "id": "option:2",
                      "idx": 2,
                      "step_id": "select:3:option:2",
                      "full_id": "TestMessage:0:message:0:select:3:option:2"
                    },
                    "props": {
                      "value": "3",
                      "label": "3",
                      "default": true
                    },
                    "children": []
                  }
                ]
              }
            ]
          }
        ]
      }"
    `);
  }));
});
