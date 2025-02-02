/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-base-to-string,@typescript-eslint/restrict-template-expressions */
import type {Pragma} from '#src/disreact/model/pragma.nodes.ts';



type PropsS = {children?: Pragma | null} | null;
type PropsM = {children: Pragma[]};



export const __Fragment = undefined;

export const _jsx = (type: JSX.ElementType, props: PropsS = {}): Pragma | Pragma[] => {
  if (!props)
    return _jsxs(type, {children: []});
  if (!props.children)
    return _jsxs(type, {...props, children: []});
  if (Array.isArray(props.children))
    return _jsxs(type, {...props, children: props.children.flat()});
  return _jsxs(type, {...props, children: [props.children]});
};

export const _jsxs = (type: JSX.ElementType, props: PropsM): Pragma | Pragma[] => {
  if (!type)
    return props.children;

  return type;
};
