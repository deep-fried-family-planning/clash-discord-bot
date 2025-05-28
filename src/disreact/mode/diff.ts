import * as El from '#src/disreact/mode/entity/el.ts';
import * as Polymer from '#src/disreact/mode/entity/polymer.ts';
import * as Equal from 'effect/Equal';
import {globalValue} from 'effect/GlobalValue';

export namespace Diff {
  export type Skip = {
    _tag: 'Skip';
  };
  export type Insert = {
    _tag: 'Insert';
    node: El.El;
  };
  export type Remove = {
    _tag: 'Remove';
  };
  export type Replace = {
    _tag  : 'Replace';
    node  : El.El;
    after?: Insert[] | undefined;
  };
  export type Update = {
    _tag  : 'Update';
    node  : El.El;
    after?: Insert[] | undefined;
  };
  export type Render = {
    _tag: 'Render';
  };
  export type Diff = | Skip
                     | Replace
                     | Update
                     | Insert
                     | Remove;
  export type Nd = | Skip
                   | Replace
                   | Update;
  export type Cd = | Skip
                   | Replace
                   | Update
                   | Insert
                   | Remove;
}
export type Diff = Diff.Diff;
export type Nd = Diff.Nd;
export type Cd = Diff.Cd;

const skip = (): Diff.Skip => ({_tag: 'Skip'});
const replace = (node: El.El, after?: Diff.Insert[]): Diff.Replace => ({_tag: 'Replace', node, after});
const update = (node: El.El, after?: Diff.Insert[]): Diff.Update => ({_tag: 'Update', node, after});
const insert = (node: El.El): Diff.Insert => ({_tag: 'Insert', node});
const remove = (): Diff.Remove => ({_tag: 'Remove'});
const render = (): Diff.Render => ({_tag: 'Render'});

const diffs = globalValue(
  Symbol.for('disreact/diffs'),
  () => new WeakMap<El.El, Diff.Nd>(),
);

export const get = (el: El.El): Diff.Diff => diffs.get(el)!;

export const node = (a: El.El, b: El.El) => {
  if (Equal.equals(a, b)) {
    return skip();
  }
  if (a._tag !== b._tag) {
    return replace(b);
  }
  if (El.isText(a) || El.isText(b)) {
    return replace(b);
  }
  if (El.isRest(a) || El.isRest(b)) {
    return update(b);
  }
  if (!Equal.equals(a.props, b.props)) {
    return render();
  }
  const polymer = Polymer.get(a);
  if (polymer.rc === 0) {
    return render();
  }
  if (!Equal.equals(polymer.stack, polymer.saved)) {
    return render();
  }
  return skip();
};

export const children = (cs: El.El[], rs: El.El[]) => {
  const acc = [] as any;
  for (let i = 0; i < Math.max(cs.length, rs.length); i++) {
    const c = cs[i];
    const r = rs[i];
    if (!c && r) {
      acc.push(insert(r));
    }
    else if (c && !r) {
      acc.push(remove());
    }
    else if (c && r) {
      acc.push(node(c, r));
    }
  }
};
