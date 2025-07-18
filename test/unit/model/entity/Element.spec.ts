import * as Jsx from '#disreact/runtime/Jsx.tsx';
import * as Element from '#disreact/model/entity/Element.ts';

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
  const jsx = Jsx.makeJsx(Jsx.Fragment, {});
  const actual = Element.makeIntrinsic(jsx);

  expect(json(actual)).toMatchInlineSnapshot(`
    "{
      "_tag": "Intrinsic",
      "props": {
        "_id": "Props",
        "value": {}
      }
    }"
  `);
});

it('should transform intrinsic jsx', () => {
  const jsx = Jsx.makeJsx('div', {});
  const actual = Element.makeIntrinsic(jsx);

  expect(json(actual)).toMatchInlineSnapshot(`
    "{
      "_tag": "Intrinsic",
      "type": "div",
      "props": {
        "_id": "Props",
        "value": {}
      }
    }"
  `);
});

it('should transform function component jsx', () => {
  const jsx = Jsx.makeJsx(() => null, {});
  const actual = Element.makeIntrinsic(jsx);

  expect(json(actual)).toMatchInlineSnapshot(`
    "{
      "_tag": "Intrinsic",
      "type": {
        "_id": "FunctionComponent",
        "name": "Anonymous",
        "props": false,
        "state": true
      },
      "props": {
        "_id": "Props",
        "value": {}
      }
    }"
  `);
});
