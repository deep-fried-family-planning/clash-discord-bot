import {decodeFromHookStore, encodeToHookStore} from '#discord/hooks/query-codec.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import {Const, type Slice} from '..';


export const createUseDispatch = () => () => {};


export const createUseEffect = (
  effects: [str, () => void][],
  params: URLSearchParams,
) => <
  T extends | (() => void),
>(
  id: str,
  effect: T,
) => {
  const exists = params.has(id);

  if (exists) {
    return;
  }

  effects.push([id, effect]);

  params.set(id, 'true');
};


export const createUseSlice = (
  slices: str[],
  params: URLSearchParams,
) => <
  T extends ReturnType<typeof Slice.make>,
>(
  slice: T,
) => {
  slices.push(slice.name);

  const exists = params.has(slice.name);

  if (exists) {
    return;
  }
};


export const createUseState = (
  states: str[],
  params: URLSearchParams,
) => <
  T,
>(
  id: str,
  initial: T,
) => {
  const realId = typeof initial === 'number'
    ? `${id}_n`
    : id;

  states.push(realId);

  const updater = (updated: T) => {
    encodeToHookStore(realId, updated, params);
  };

  const value = decodeFromHookStore<T>(realId, params);

  if (value === undefined) {
    updater(initial);
    return [initial, updater] as const;
  }

  return [value, updater] as const;
};


export const createUseView = (
  views: [str, str, str],
) => () => {
  const openView = (next: str, modifier?: str) => {
    views[1] = next;
    if (modifier) {
      views[2] = Const.ENTRY;
    }
  };

  const openDialog = (next: str) => {
    views[1] = next;
    views[2] = Const.DIALOG;
  };


  const setViewModifier = (next: str) => {
    views[2] = next;
  };

  return [
    openView,
    openDialog,
    setViewModifier,
  ] as const;
};


export const createUseComponent = (
  params: URLSearchParams,
) => {
  let components = {};

  const set = () => {
    components = {};
  };

  return {
    useComponent: (
      id: str,
      initial: str,
    ) => {
      const exists = params.get(id);

      if (exists) {
        return;
      }

      params.set(id, 'true');

      const thing = () => {

      };
    },
  };
};


export const createUseAccessor = () => () => {};
