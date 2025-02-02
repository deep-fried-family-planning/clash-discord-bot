/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-base-to-string,@typescript-eslint/restrict-template-expressions */
import type {Pragma} from '#src/disreact/dsx/pragma.nodes.ts';



type PropsS = {children?: Pragma | null} | null;
type PropsM = {children: Pragma[]};



export const _Fragment = undefined;



export const _dsx = (type: JSX.ElementType, props: PropsS = {}): Pragma | Pragma[] => {
  if (!props)
    return _dsxs(type, {children: []});

  if (!props.children)
    return _dsxs(type, {...props, children: []});

  if (Array.isArray(props.children))
    return _dsxs(type, {...props, children: props.children.flat()});

  return _dsxs(type, {...props, children: [props.children]});
};



export const _dsxs = (type: JSX.ElementType, props: PropsM): Pragma | Pragma[] => {
  const children = props.children;

  // @ts-expect-error convenience lol
  delete props.children;

  switch (typeof type) {
    case 'string':
      return {
        kind    : 'intrinsic',
        name    : type as keyof JSX.IntrinsicElements,
        index   : 0,
        id      : '',
        id_step : '',
        id_full : '',
        props   : props,
        children: children,
      };
    case 'function':
      return {
        kind    : 'function',
        name    : type.name,
        index   : 0,
        id      : '',
        id_step : '',
        id_full : '',
        props   : props,
        children: [type(props)],
        render  : type,
      };

    case 'boolean':
    case 'number':
    case 'bigint':
    case 'symbol':
      return {
        kind : 'text',
        name : 'string',
        value: String(type),
      };

    case 'undefined':
      return props.children;

    default:
      throw new Error('Unknown Tag');
  }
};
