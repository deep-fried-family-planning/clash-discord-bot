import type {Hooks} from '#src/disreact/internal/dsx/types.ts';
import {_useEffect} from '#src/disreact/internal/hooks/use-effect.ts';
import {_useIx} from '#src/disreact/internal/hooks/use-ix.ts';
import {_usePage} from '#src/disreact/internal/hooks/use-page.ts';
import {_useReducer, _useState} from '#src/disreact/internal/hooks/use-reducer.ts';



export const emptyHooks = (
  id: string,
): Hooks => ({
  id,
  pc      : 0,
  stack   : [],
  sync    : [],
  async   : [],
  rc      : 0,
  nextpage: null as null | string,
});



export const attachHooks = (fiber: Hooks) => ({
  useState  : _useState(fiber),
  useReducer: _useReducer(fiber),
  useEffect : _useEffect(fiber),
  usePage   : _usePage(),
  useIx     : _useIx(),
});
