import * as El from '#src/disreact/model/entity/el.ts';
import * as Stack from '#src/disreact/model/util/stack.ts';
import * as FC from '#src/disreact/model/entity/fc.ts';
import * as Polymer from '#src/disreact/model/entity/polymer.ts';
import * as Props from '#src/disreact/model/entity/props.ts';
import * as MutableList from 'effect/MutableList';
import * as Record from 'effect/Record';
import type * as Declarations from '#src/disreact/model/util/declarations.ts';


export declare namespace Rehydrant {
  export type Registrant = FC.Any | El.El;
  export type SourceId = string | FC.Any | El.El;
  export type Source = {
    id  : string;
    elem: El.Comp;
  };
  export type Rehydrant = {
    id   : string;
    props: any;
    elem : El.Comp;
    data : any;
    poly : Record<string, Polymer.Polymer>;
    next : {id: string | null; props?: any};
    stack: Stack.Stack;
  };
  export type Hydrator = typeof Declarations.Hydrator.Type;
  export type Encoded = typeof Declarations.Hydrator.Encoded;
}
export type Registrant = Rehydrant.Registrant;
export type SourceId = Rehydrant.SourceId;
export type Source = Rehydrant.Source;
export type Rehydrant = Rehydrant.Rehydrant;
export type Hydrator = Rehydrant.Hydrator;
export type Encoded = Rehydrant.Encoded;

export const source = (input: Registrant, id?: string): Source => {
  if (FC.isFC(input)) {
    const fn = El.comp(input, {});
    if (id) {
      fn.type[FC.FCNameId] = id;
    }
    return {
      id  : fn.type[FC.FCNameId]!,
      elem: fn,
    };
  }
  if (El.isComp(input)) {
    if (id) {
      input.type[FC.FCNameId] = id;
    }
    return {
      id  : input.type[FC.FCNameId]!,
      elem: input,
    };
  }
  throw new Error('Invalid Input');
};

export const fromSource = (source: Source, props: any, data: any): Rehydrant => {
  const cloned = El.comp(source.elem.type, props ?? {});
  return {
    id   : source.id,
    props: cloned.props,
    elem : cloned,
    data : data ?? {},
    poly : {},
    next : {id: source.id, props: cloned.props},
    stack: Stack.make(),
  };
};

export const fromFC = (fc: FC.Any, props: any, data: any): Rehydrant => {
  const comp = El.comp(fc, props);
  return {
    id   : comp.type[FC.FCNameId]!,
    props: comp.props,
    elem : comp,
    data : data,
    poly : {},
    next : {id: FC.name(comp.type), props: comp.props},
    stack: Stack.make(),
  };
};

export const fromHydrator = (source: Source, hydrator: Hydrator, data: any): Rehydrant => {
  const cloned = El.comp(source.elem.type, hydrator.props);
  return {
    id   : source.id,
    props: cloned.props,
    elem : cloned,
    data : data,
    poly : Record.map(hydrator.stacks, (s) => Polymer.decode(s)),
    next : {id: source.id},
    stack: Stack.make(),
  };
};

export const hydrator = (rehydrant: Rehydrant): Hydrator => {
  const stack = Stack.make(rehydrant.elem);
  const acc = {} as any;
  while (Stack.check(stack)) {
    const node = Stack.pop(stack);
    if (El.isText(node)) {
      continue;
    }
    if (El.isComp(node)) {
      acc[node.idn!] = Polymer.get(node).stack;
    }
    for (let i = 0; i < node.nodes.length; i++) {
      const next = node.nodes[i];
      Stack.push(stack, next);
    }
  }
  return {
    id    : rehydrant.id,
    props : rehydrant.props,
    stacks: acc,
  };
};

export const addNode = (rehydrant: Rehydrant, node: El.Nd) => {

};

export const getNode = (rehydrant: Rehydrant) => {

};
