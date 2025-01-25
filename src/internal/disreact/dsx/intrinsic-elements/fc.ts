/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-return */
import {Children} from '#disreact/dsx/intrinsic-elements/index.ts';
import {jsx} from '#disreact/dsx/jsx-runtime.ts';
import type {ne, str, unk} from '#src/internal/pure/types-pure.ts';



export const dsx    = 'pfc';
export const tagged = (x: unk): x is Type => typeof x === 'function';
export const typed  = (x: unk): x is Model => typeof x === 'object' && x !== null && 'tag' in x && x.tag === dsx;

export type Type<A = ne> = (props: ne) => A;

export type Model<A = ne> = {
  _tag  : typeof dsx;
  name  : str;
  render: (next: ne) => A;
  props : ne;
};


export const jsxFunction = <A = ne>(
  tag: Type<A>,
  props: ne,
): Model<A> => {
  const output = tag(props);


  return {
    _tag  : dsx,
    name  : tag.name,
    render: (next) => jsx(tag, next),
    props : {
      ...props,
      children: Children.asNodes(output),
    },
  };
};
