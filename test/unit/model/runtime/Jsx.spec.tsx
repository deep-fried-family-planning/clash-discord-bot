// import * as Jsx from '#disreact/model/runtime/Jsx.ts';
import {TestDialog} from '#unit/components/test-dialog.tsx';

it('when transpiling fragment', () => {
  const jsx = <></>;

  expect(jsx).toMatchInlineSnapshot();
});

it('when transpiling intrinsic', () => {

});

it('when transpiling function component', () => {

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
        "child": undefined,
        "ctx": {
          "columnNumber": 12,
          "fileName": "/Users/ryan/repos/deep-fried-family-planning/clash-discord-bot/test/unit/model/runtime/Jsx.spec.tsx",
          "lineNumber": 6,
        },
        "key": undefined,
        "props": {},
        "src": false,
        "type": [Function],
      }
    `);
  });
});
