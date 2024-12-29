import {getParam, setParam} from '#discord/context/controller-params.ts';
import {addStateHookId} from '#discord/hooks/hooks.ts';
import type {str} from '#src/internal/pure/types-pure.ts';


const createStateParamId = <T>(id: str, initial: T) => {
  if (typeof initial === 'number') {
    return `s_${id}_n`;
  }
  return `s_${id}`;
};


const decodeStateParam = <T>(id: str, val: str) => {
  const [type] = id.split('_').toReversed();

  const decoded = JSON.parse(decodeURIComponent(val)) as T;

  if (type === 'n') {
    return parseInt(decoded as str) as T;
  }

  return decoded;
};


const encodeStateParam = <T>(val: T) => encodeURIComponent(JSON.stringify(val));


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
