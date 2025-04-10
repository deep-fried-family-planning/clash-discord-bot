import {Data, Equal} from 'effect';

export * as Props from '#src/disreact/model/entity/props.ts';
export type Props = any;

export const jsx = (props: any): Props => {
  if (!props) {
    return props;
  }

  if (!props.children) {
    //
  }
  else {
    props.children = [props.children];
  }

  return props;
};

export const jsxs = (props: any): Props => {
  return props;
};

export const isEqual = (a: Props, b: Props): boolean => {
  if (a === b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  if (a === null || b === null) {
    return false;
  }
  if (a === undefined || b === undefined) {
    return false;
  }
  if (a._tag !== b._tag) {
    return false;
  }

  const cprops = Data.struct(a);
  const rprops = Data.struct(b);

  return Equal.equals(cprops, rprops);
};

export const isDeepEqual = (a: any, b: any) => {
  if (a === b) return true;
  if (!a || !b) return false;

  const typeA = typeof a;
  const typeB = typeof b;

  if (typeA !== 'object') return false;
  if (typeB !== 'object') return false;

  if (typeof a !== 'object' || typeof b !== 'object') return false;
  if (a.constructor !== b.constructor) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; ++i) {
      if (!isDeepEqual(a[i], b[i])) return false;
    }
    return true;
  }
};
