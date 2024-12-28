import {createStateParamId, decodeStateParam, encodeStateParam} from '#discord/hooks/state-param.ts';
import {addStateHookId} from '#discord/hooks/store-hooks.ts';
import {getParam, setParam} from '#discord/hooks/controller-params.ts';
import type {str} from '#src/internal/pure/types-pure.ts';


export const useState = <T>(id: str, initial: T) => {
  const state_id = createStateParamId(id, initial);

  addStateHookId(state_id);

  const updater = (updated: T) => {
    setParam(state_id, encodeStateParam(updated));
  };

  const current = getParam(state_id);

  if (current === null) {
    updater(initial);
    return [initial, updater] as const;
  }

  return [decodeStateParam<T>(state_id, current), updater] as const;
};
