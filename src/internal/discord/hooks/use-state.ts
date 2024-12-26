import {decodeFromHookStore, encodeToHookStore} from '#discord/hooks/hook-store.ts';
import type {str} from '#src/internal/pure/types-pure.ts';


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
