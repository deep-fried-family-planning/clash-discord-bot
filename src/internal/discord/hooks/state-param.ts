import type {str} from '#src/internal/pure/types-pure.ts';


export const createStateParamId = <T>(id: str, initial: T) => {
  if (typeof initial === 'number') {
    return `s_${id}_n`;
  }
  return `s_${id}`;
};


export const decodeStateParam = <T>(id: str, val: str) => {
  const [type] = id.split('_').toReversed();

  const decoded = JSON.parse(decodeURIComponent(val)) as T;

  if (type === 'n') {
    return parseInt(decoded as str) as T;
  }

  return decoded;
};


export const encodeStateParam = <T>(val: T) => encodeURIComponent(JSON.stringify(val));
