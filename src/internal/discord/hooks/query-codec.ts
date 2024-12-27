// import type {str, und} from '#src/internal/pure/types-pure.ts';
//
//
// const store = new Map<str, URLSearchParams>();
//
//
// export const clear = () => {
//   store.clear();
// };
//
//
// export const set = <T>(namespace: str, key: str, val: T) => {
//   store.set(key, val);
// };
//
//
// export const del = (key: str) => {
//   store.delete(key);
// };
//
//
// export const get = <T>(key: str) => store.get(key) as T | und;


import type {str} from '#src/internal/pure/types-pure.ts';


export const decodeFromHookStore = <T>(id: str, params: URLSearchParams) => {
  const [type] = id.split('_').toReversed();

  const val = params.get(id);

  if (!val) {
    return undefined;
  }

  const decoded = JSON.parse(decodeURIComponent(val)) as T;

  if (type === 'n') {
    return parseInt(decoded as str) as T;
  }
  return decoded;
};


export const encodeToHookStore = <T>(id: str, val: T, params: URLSearchParams) => {
  const encoded = encodeURIComponent(JSON.stringify(val));

  params.set(id, encoded);
};
