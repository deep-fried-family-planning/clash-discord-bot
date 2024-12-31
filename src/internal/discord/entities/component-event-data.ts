import {StateError} from '#discord/entities/errors.ts';
import {Cx, type Nx} from '#discord/entities/index.ts';
import type {IxIn} from '#discord/types.ts';
import type {ManagedOp, SelectOp} from '#pure/dfx';
import {D, pipe} from '#pure/effect';
import type {str} from '#src/internal/pure/types-pure.ts';


export type Meta<A, B = never, C = false> = {
  path       : Cx.Path;
  target     : A;
  firstValue : C extends true ? str : never;
  values     : C extends true ? str[] : never;
  allValues  : C extends true ? str[] : never;
  firstOption: C extends true ? B : never;
  options    : C extends true ? B[] : never;
  allOptions : C extends true ? B[] : never;
};


export type T = D.TaggedEnum<{
  click  : Meta<Extract<Cx.T, {_tag: 'Button'}>['data']>;
  select : Meta<Extract<Cx.T, {_tag: 'Select'}>['data'], SelectOp, true>;
  managed: Meta<Extract<Cx.T, {_tag: 'User' | 'Role' | 'Channel' | 'Mentionable'}>['data'], ManagedOp, true>;
}>;


export const T = D.taggedEnum<T>();


export const make = (ix: IxIn, rx: Nx.T) => {
  const path = Cx.Path.parse(ix.data.custom_id);

  const target = pipe(rx.components, Cx.getAt(path.row, path.col));

  if (!target) {
    throw new StateError({});
  }

  const options = Cx.getOptions(target);
  // const
  //
  // {
  //   target  : component.data as never,
  //     first   : Cx.getSelectedValues(component).at(0) ?? '',
  //   selected: Cx.getSelectedValues(component),
  //   values  : Cx.getSelectedOptions(component) as never,
  //   options : Cx.getOptions(component) as never,
  // }

  if (Cx.isManaged(target)) {
    const [] = [];

    return T.managed({
      path,
      target,
    });
  }

  return {
    path,
    target,
  };
};
