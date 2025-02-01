/* eslint-disable @typescript-eslint/no-explicit-any */
import type {JSX} from '#src/disreact/jsx-runtime.ts';
import {E} from '#src/internal/pure/effect.ts';


type Props = Record<string, any>;
type WithChildren = Props & {children?: JSX.ElementType | JSX.ElementType[]};

type JsxProps = {children?: JSX.Element} | null;
type JsxsProps = {children: JSX.Element[]};

export const _Fragment = (props: WithChildren = {}) => props.children;

export const _jsx = (type: JSX.ElementType, config: JsxProps = {}) => {
  if (!config || !config.children) {
    return _jsxs(type, {children: []});
  }

  return _jsxs(type, {...config, children: [config.children]});
};

export const _jsxs = (type: JSX.ElementType, config: JsxsProps) => {
  switch (typeof type) {
    case 'function': {
      const output = type(config);

      if (E.isEffect(output)) {
        return output;
      }

      return output;
    }
  }


  return {};
};

export const _jsxDEV = () => {};
