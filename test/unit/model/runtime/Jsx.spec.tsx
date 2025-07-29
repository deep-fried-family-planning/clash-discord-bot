import * as Jsx from '#disreact/runtime/Jsx.tsx';
import {TestDialog} from '#unit/components/test-dialog.tsx';

const json = (actual: any) => JSON.stringify(actual, null, 2);

it('when transpiling fragment shorthand', () => {
  const jsx = (
    <>
      {'jsx'}
    </>
  );

  expect(json(jsx)).toMatchInlineSnapshot(`
    "{
      "_id": "Jsx",
      "type": "Fragment",
      "props": {},
      "children": "jsx"
    }"
  `);
});

it('when transpiling fragment', () => {
  const jsx = (
    <Jsx.Fragment key={'key'}>
      {'jsx'}
    </Jsx.Fragment>
  );

  expect(json(jsx)).toMatchInlineSnapshot(`
    "{
      "_id": "Jsx",
      "type": "Fragment",
      "props": {},
      "children": "jsx"
    }"
  `);
});

it('when transpiling intrinsic', () => {
  const jsx = (
    <button>
      {'text'}
    </button>
  );

  expect(json(jsx)).toMatchInlineSnapshot(`
    "{
      "_id": "Jsx",
      "type": "button",
      "props": {},
      "children": "text"
    }"
  `);
});

it('when transpiling function component', () => {
  const FC = () =>
    (
      <button>
        {'text'}
      </button>
    );

  const jsx = <FC/>;

  expect(json(jsx)).toMatchInlineSnapshot(`
    "{
      "_id": "Jsx",
      "props": {}
    }"
  `);
});

describe('given fragment with nested intrinsics', () => {
  it('when transpiled', () => {

  });

  it('when designating entrypoint', () => {

  });
});

describe('given function component with nested intrinsics', () => {
  it('when transpiled', () => {

  });

  it('when designating entrypoint', () => {

  });
});

describe('given TestDialog', () => {
  it('when transpiled', () => {
    expect(<TestDialog/>).toMatchInlineSnapshot(`
      {
        "_id": "Jsx",
        "children": undefined,
        "key": undefined,
        "props": {},
        "type": [Function],
      }
    `);
  });
});
