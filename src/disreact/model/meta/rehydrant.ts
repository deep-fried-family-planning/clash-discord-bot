import type {Declare} from '#src/disreact/model/declare.ts';
import {Elem} from '#src/disreact/model/elem/elem.ts';
import {Fibril} from '#src/disreact/model/meta/fibril.ts';
import type {Source} from '#src/disreact/model/meta/source.ts';
import {Pragma} from 'src/disreact/model/pragma.ts';
import * as MutableList from 'effect/MutableList';
import * as Record from 'effect/Record';

export * as Rehydrant from '#src/disreact/model/meta/rehydrant.ts';
export type Rehydrant = {
  id      : string;
  props?  : any;
  elem    : Elem.Node;
  next    : {id: string | null; props?: any};
  data    : any;
  fibrils : {[id: string]: Fibril};
  mount   : MutableList.MutableList<Elem.Node>;
  dismount: MutableList.MutableList<Elem.Node>;
  diffs   : MutableList.MutableList<[Elem, Elem]>;
  render  : MutableList.MutableList<[Elem, Elem] | [Elem.Task, number]>;
};
export type Decoded = typeof Declare.Hydrator.Type;
export type Encoded = typeof Declare.Hydrator.Encoded;

export const make = (src: Source, props?: any): Rehydrant => {
  const elem = Pragma.clone(src.elem) as Elem.Node;
  elem.props = props;
  elem.id = src.id;

  const rehydrant: Rehydrant = {
    id      : src.id,
    props   : props,
    elem    : elem,
    next    : {id: src.id},
    data    : {},
    fibrils : {},
    mount   : MutableList.empty(),
    dismount: MutableList.empty(),
    diffs   : MutableList.empty(),
    render  : MutableList.empty(),
  };

  if (Elem.isTask(rehydrant.elem)) {
    rehydrant.elem.fibril.rehydrant = rehydrant;
    rehydrant.elem.fibril.elem = rehydrant.elem;
    rehydrant.fibrils[rehydrant.id] = rehydrant.elem.fibril;
  }

  return rehydrant;
};

export const dehydrate = (rehydrant: Rehydrant): Decoded => ({
  id    : rehydrant.id,
  props : rehydrant.props,
  stacks: Record.map(rehydrant.fibrils, (fibril) => fibril.stack),
});

export const rehydrate = (src: Source, dehydrated: Decoded) => {
  const rehydrant = make(src, dehydrated.props);
  rehydrant.id = dehydrated.id;
  rehydrant.props = dehydrated.props;
  rehydrant.fibrils = Record.map(dehydrated.stacks, (stack, id) => Fibril.make(stack));

  if (Elem.isTask(rehydrant.elem)) {
    if (rehydrant.fibrils[rehydrant.elem.id!]) {
      rehydrant.elem.fibril = rehydrant.fibrils[rehydrant.elem.id!];
    }
  }

  return rehydrant;
};

export const mountTask = (root: Rehydrant, elem: Elem.Task) => {
  elem.fibril.rehydrant = root;
  elem.fibril.elem = elem;
  root.fibrils[elem.id!] = elem.fibril;
};
