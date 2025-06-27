import {useEffect, useIx, usePage, useReducer, useState} from '#src/disreact/index.ts';

it('when called outside a component', () => {
  expect(useState).toThrowErrorMatchingInlineSnapshot(`[Error: Hooks must be called within a component.]`);
  expect(useReducer).toThrowErrorMatchingInlineSnapshot(`[Error: Hooks must be called within a component.]`);
  expect(useEffect).toThrowErrorMatchingInlineSnapshot(`[Error: Hooks must be called within a component.]`);
  expect(useIx).toThrowErrorMatchingInlineSnapshot(`[Error: Hooks must be called within a component.]`);
  expect(usePage).toThrowErrorMatchingInlineSnapshot(`[Error: Hooks must be called within a component.]`);
});
