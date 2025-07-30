import * as Element from '#disreact/model/entity/Element.ts';
import * as Lifecycle from '#disreact/model/lifecycle.ts';
import * as Jsx from '#disreact/model/runtime/Jsx.tsx';
import {it} from '@effect/vitest';
import * as Effect from 'effect/Effect';

const json = (actual: any) => JSON.stringify(actual, null, 2);

it('should transform text', () => {
  const actual = Element.makeText('text');

  expect(json(actual)).toMatchInlineSnapshot(`
    "{
      "_tag": "Text",
      "text": "text"
    }"
  `);
});

it('should transform fragment jsx', () => {
  const jsx = Jsx.makeJsx(Jsx.Fragment, {k: 'v'});
  const actual = Element.makeFragment(jsx);

  expect(json(actual)).toMatchInlineSnapshot(`
    "{
      "_tag": "Fragment"
    }"
  `);
});

it('should transform intrinsic jsx', () => {
  const jsx = Jsx.makeJsx('div', {k: 'v'});
  const actual = Element.makeIntrinsic(jsx);

  expect(json(actual)).toMatchInlineSnapshot(`
    "{
      "_tag": "Intrinsic",
      "type": "div",
      "props": {
        "k": "v"
      }
    }"
  `);
});

it('should transform function component jsx', () => {
  const jsx = Jsx.makeJsx(() => null, {k: 'v'});
  const actual = Element.makeComponent(jsx);

  expect(json(actual)).toMatchInlineSnapshot(`
    "{
      "_tag": "Component",
      "type": "Anonymous",
      "props": {
        "k": "v"
      },
      "polymer": {
        "_id": "Polymer",
        "pc": 0,
        "rc": 0,
        "stack": [],
        "queue": []
      }
    }"
  `);
});

it.effect('should render function component jsx', Effect.fn(function* () {
  const jsx = Jsx.makeJsx(
    () =>
      Jsx.makeJsx('div1', {
        children: Jsx.makeJsxs('div2', {
          children: [
            Jsx.makeJsx('div3', {}),
            Jsx.makeJsx('div4', {k: 'v'}),
          ],
        }),
      }),
    {},
  );
  const element = Element.makeComponent(jsx);
  const actual = yield* Lifecycle.initializeCycle(element);

  expect(json(actual)).toMatchInlineSnapshot(`
    "{
      "_tag": "Component",
      "type": "Anonymous",
      "props": {},
      "polymer": {
        "_id": "Polymer",
        "pc": 0,
        "rc": 0,
        "stack": [],
        "queue": []
      },
      "children": [
        {
          "_tag": "Intrinsic",
          "type": "div1",
          "props": {},
          "children": [
            {
              "_tag": "Intrinsic",
              "type": "div2",
              "props": {},
              "children": [
                {
                  "_tag": "Intrinsic",
                  "type": "div3",
                  "props": {}
                },
                {
                  "_tag": "Intrinsic",
                  "type": "div4",
                  "props": {
                    "k": "v"
                  }
                }
              ]
            }
          ]
        }
      ]
    }"
  `);
}));
