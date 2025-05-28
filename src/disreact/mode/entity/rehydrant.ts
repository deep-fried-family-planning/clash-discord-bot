import * as El from '#src/disreact/mode/entity/el.ts';
import * as FC from '#src/disreact/mode/entity/fc.ts';
import * as Polymer from '#src/disreact/mode/entity/polymer.ts';
import * as MutableList from 'effect/MutableList';
import * as Record from 'effect/Record';
import type * as Declarations from '#src/disreact/mode/schema/declarations.ts';

export declare namespace Rehydrant {
  export type Registrant = FC.FC | El.El;
  export type SourceId = string | FC.FC | El.El;
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
    nodes: MutableList.MutableList<El.Node>;
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

export const source = (input: Rehydrant.Registrant, id?: string): Rehydrant.Source => {
  if (FC.isFC(input)) {
    const fn = El.comp(input, {});
    if (id) {
      fn.type[FC.NameId] = id;
    }
    return {
      id  : fn.type[FC.NameId]!,
      elem: fn,
    };
  }
  if (El.isComp(input)) {
    if (id) {
      input.type[FC.NameId] = id;
    }
    return {
      id  : input.type[FC.NameId]!,
      elem: input,
    };
  }
  throw new Error('Invalid Input');
};

export const synthesizeFromFC = <A extends FC.FC>(fc: A, props: Parameters<A>[0], data?: any) => {

};

export const fromSource = (source: Rehydrant.Source, props: any, data: any): Rehydrant.Rehydrant => {
  const cloned = El.comp(source.elem.type, props);
  return {
    id   : source.id,
    props: props,
    elem : cloned,
    data : data,
    poly : {},
    next : {id: source.id},
    nodes: MutableList.empty(),
  };
};

export const fromHydrator = (source: Rehydrant.Source, hydrator: Rehydrant.Hydrator, data: any): Rehydrant.Rehydrant => {
  const cloned = El.comp(source.elem.type, hydrator.props);
  return {
    id   : source.id,
    props: hydrator.props,
    elem : cloned,
    data : data,
    poly : Record.map(hydrator.stacks, (s) => Polymer.decode(s)),
    next : {id: source.id},
    nodes: MutableList.empty(),
  };
};

export const hydrator = (rehydrant: Rehydrant.Rehydrant): Rehydrant.Hydrator => {
  const stack = El.stack(rehydrant.elem);
  const acc = {} as any;
  while (El.check(stack)) {
    const next = El.pop(stack);
    if (El.isComp(next)) {
      acc[next.idn!] = Polymer.get(next).stack;
    }
    El.push(stack, next);
  }
  return {
    id    : rehydrant.id,
    props : rehydrant.props,
    stacks: acc,
  };
};
