import {Keys} from '#src/disreact/codec/rest-elem/keys.ts';
import type {Trigger} from '#src/disreact/model/elem/trigger.ts';
import {Data, Equal} from 'effect';

const HANDLER_KEYS = [
  Keys.onclick,
  Keys.onselect,
  Keys.onsubmit,
];

const RESERVED = [
  ...HANDLER_KEYS,
  Keys.children,
  Keys.handler,
];

export * as Props from '#src/disreact/model/elem/props.ts';
export type Props = any;

export const cloneKnownProps = (props: Props): Props => {
  const reserved = {} as any;

  for (const key of RESERVED) {
    const prop = props[key];
    if (prop) {
      reserved[key] = prop;
      delete props[key];
    }
  }

  const cloned = structuredClone(props);

  for (const key of Object.keys(reserved)) {
    cloned[key] = reserved[key];
  }

  return cloned;
};

export const getHandler = (props: Props): Trigger.Handler<any> | undefined => {
  for (let i = 0; i < HANDLER_KEYS.length; i++) {
    const key = HANDLER_KEYS[i];
    const handler = props[key];

    if (handler) {
      delete props[key];
      return handler;
    }
  }
};

export const isEqual = (a: Props, b: Props): boolean => {
  if (a === b) return true;
  if (!a || !b) return false;

  if (a.children && b.children) {
    if (a.children.length !== b.children.length) return false;
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

export const deepCloneTaskProps = (props: any): any => {
  if (!props) {
    return props;
  }

  try {
    return structuredClone(props);
  }
  catch (e) {/**/}

  const acc = {} as any;

  for (const key of Object.keys(props)) {
    const original = props[key];
    const originalType = typeof original;

    if (originalType === 'object') {
      if (!original) {
        acc[key] = null;
        continue;
      }
      if (Array.isArray(original)) {
        acc[key] = original.map((item) => deepCloneTaskProps(item));
        continue;
      }
      acc[key] = deepCloneTaskProps(original);
      continue;
    }

    acc[key] = original;
  }

  return props;
};
