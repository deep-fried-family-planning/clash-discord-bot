import {cloneTree} from '#src/disreact/codec/element/index.ts';
import {jsx} from '#src/disreact/jsx-runtime.ts';
// import * as Globals from '#src/disreact/model/a/globals.ts';
import {invokeIntrinsicTarget} from '#src/disreact/model/a/invoke.ts';
import {hydrateRoot, initialRender, rerenderRoot} from '#src/disreact/model/a/render.ts';
import {collectStates, reduceToStacks} from '#src/disreact/model/a/utils.ts';
import {Element} from '#src/disreact/model/entity/element';
import {Root} from '#src/disreact/model/root';
import {SourceRegistry} from '#src/disreact/model/SourceRegistry.ts';
import {E} from '#src/internal/pure/effect.ts';
import {pipe} from 'effect';
import {TestMessage} from 'test/unit/disreact/components/test-message.tsx';
import {it, TestRegistry} from '../components/TestRegistry.tsx';



const nofunc = (node: Element): Element => {
  if ('props' in node && node.props && typeof node.props === 'object') {
    delete node.props['onclick'];
    delete node.props['onselect'];
  }

  if ('children' in node && node.children.length > 0) {
    node.children = node.children.map((child) => nofunc(child));
  }

  return node;
};

// afterEach(() => {
//   delete TestMessage[FC.SourceId];
// });

it.effect('when cloning a node', E.fn(function* () {
  const root     = yield* SourceRegistry.checkout(TestMessage);
  const actual   = Root.deepLinearize(Root.deepClone(root));
  const expected = Root.deepLinearize(root);

  // expect(actual.element).toEqual(expected.element);
}));

it.effect('when cloning a tree', E.fn(function* () {
  const root     = yield* SourceRegistry.checkout(TestMessage);
  const rendered = yield* initialRender(root, root.element);

  const exp = pipe(
    rendered,
    Element.linearizeDeep,
  );

  const act = pipe(
    rendered,
    Element.deepClone,
    Element.linearizeDeep,
  );

  // expect(act).toEqual(exp);
}));

it.effect('when rerendering a cloned tree', E.fn(function* () {
  const component = jsx(TestMessage, {});
  const src       = Root.make(Root.PUBLIC, component);
  const root      = Root.fromSource(src);
  const initial   = yield* initialRender(root, root.element);
  const actual    = yield* rerenderRoot(root);

  // expect(nofunc(actual.element)).toEqual(nofunc(initial));
}));

const runs = Array.from({length: 100});

describe('testing', {timeout: 100000}, () => {
  for (let i = 0; i < runs.length; i++) {
    it.live(`when hydrating an empty root ${i}`, E.fn(function* () {
      const root     = yield* SourceRegistry.checkout(TestMessage);
      const expected = yield* initialRender(root, root.element);
      const actual   = yield* hydrateRoot(root, root.element, {});

      // yield* pipe(
      //   expected,
      //   Element.clone,
      // );
      //
      // yield* pipe(expected, Element.deepClone, expectJSON('hydration-expected.json'));
      // yield* pipe(expected, Element.deepClone, expectJSON('hydration-actual.json'));

      //
      // yield* E.promise(() =>  expect(expected).toMatchFileSnapshot('hydration-expected.json'));
      // yield* E.promise(() =>  expect(actual).toMatchFileSnapshot('hydration-actual.json'));
      expect(Element.linearizeDeep(actual)).toEqual(Element.linearizeDeep(expected));
    }, E.provide(TestRegistry)));
  }
});

it.effect('when dispatching an event', E.fn(function* () {
  const component = jsx(TestMessage, {});
  const src       = Root.make(Root.PUBLIC, component);
  const root      = Root.fromSource(src);
  const initial   = yield* initialRender(root, root.element);

  const event = {
    custom_id: 'actions:2:button:0',
    prop     : 'onclick',
  } as any;

  const before     = cloneTree(initial);
  const actual     = invokeIntrinsicTarget(initial, event);
  const rerendered = yield* rerenderRoot(root);

  const beforeStacks = reduceToStacks(collectStates(before));
  const actualStacks = reduceToStacks(collectStates(rerendered.element));

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

describe('event dispatch', () => {
  describe('given event.id does not match any node.id', () => {
    it.effect('when dispatching an event', E.fn(function* () {
      given.component = jsx(TestMessage, {});
      given.clone     = cloneTree(given.component);
      given.initial   = yield* rerenderRoot(yield* initialRender(given.clone));
      given.event     = {
        custom_id: 'buttons:1:button:0',
        prop     : 'onclick',
      } as any;
      given.event.id  = 'never';

      const actual = () => invokeIntrinsicTarget(given.initial, given.event);
      expect(actual).toThrowErrorMatchingInlineSnapshot(`[Error: No node with id_step "buttons:1:button:0" having a handler for type "onclick" was not found]`);
    }));

    describe('given event.type is not in any node.props', () => {
      it.effect('when dispatching an event', E.fn(function* () {
        given.component  = jsx(TestMessage, {});
        given.clone      = cloneTree(given.component);
        given.initial    = yield* rerenderRoot(yield* initialRender(given.clone));
        given.event      = {
          custom_id: 'buttons:1:button:0',
          prop     : 'onclick',
        } as any;
        given.event.type = 'never';
        const actual     = () => invokeIntrinsicTarget(given.initial, given.event);
        expect(actual).toThrowErrorMatchingInlineSnapshot(`[Error: No node with id_step "buttons:1:button:0" having a handler for type "onclick" was not found]`);
      }));
    });
  });
});


it.effect('when rendering an initial tree', E.fn(function* () {
  given.component = jsx(TestMessage, {});
  const clone     = Lifecycles.cloneTree(given.component);
  const render    = yield* Lifecycles.initialRender(clone);

  expect(JSON.stringify(render, null, 2)).toMatchInlineSnapshot(`
        "{
          "_tag": "FunctionElement",
          "_name": "TestMessage",
          "meta": {
            "idx": 0,
            "id": "TestMessage:0",
            "step_id": "TestMessage:0",
            "full_id": "TestMessage:0",
            "isMessage": true
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
                  "_tag": "FunctionElement",
                  "_name": "Header",
                  "meta": {
                    "idx": 0,
                    "id": "Header:0",
                    "step_id": "message:0:Header:0",
                    "full_id": "TestMessage:0:message:0:Header:0"
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
                    "queue": []
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
                            "idx": 0,
                            "id": "string:0",
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
                            "idx": 0,
                            "id": "string:0",
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
                                "idx": 1,
                                "id": "string:1",
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
                            "idx": 0,
                            "id": "string:0",
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
                            "idx": 1,
                            "id": "string:1",
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
