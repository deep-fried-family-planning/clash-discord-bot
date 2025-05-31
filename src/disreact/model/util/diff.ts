import * as El from '#src/disreact/model/entity/el.ts';
import * as Polymer from '#src/disreact/model/entity/polymer.ts';
import * as Equal from 'effect/Equal';
import * as GlobalValue from 'effect/GlobalValue';

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
    _tag: 'Replace';
    node: El.El;
  };
  export type Update = {
    _tag: 'Update';
    node: El.El;
  };
  export type Render = {
    _tag: 'Render';
  };
  export type Diff = | Skip
                     | Replace
                     | Update
                     | Insert
                     | Remove
                     | Render;
  export type Nd = | Skip
                   | Replace
                   | Update;
  export type Cd = | Skip
                   | Replace
                   | Update
                   | Insert
                   | Render
                   | Remove;
}
export type Diff = Diff.Diff;
export type Nd = Diff.Nd;
export type Cd = Diff.Cd;

export const isSkip = (diff: Diff.Diff): diff is Diff.Skip => diff._tag === 'Skip';

export const isInsert = (diff: Diff.Diff): diff is Diff.Insert => diff._tag === 'Insert';

export const isRemove = (diff: Diff.Diff): diff is Diff.Remove => diff._tag === 'Remove';

export const isReplace = (diff: Diff.Diff): diff is Diff.Replace => diff._tag === 'Replace';

export const isUpdate = (diff: Diff.Diff): diff is Diff.Update => diff._tag === 'Update';

export const isRender = (diff: Diff.Diff): diff is Diff.Render => diff._tag === 'Render';

const skip = (): Diff.Skip =>
  ({
    _tag: 'Skip',
  });

const replace = (node: El.El): Diff.Replace =>
  ({
    _tag: 'Replace',
    node,
  });

const update = (node: El.El): Diff.Update =>
  ({
    _tag: 'Update',
    node,
  });

const insert = (node: El.El): Diff.Insert =>
  ({
    _tag: 'Insert',
    node,
  });

const remove = (): Diff.Remove =>
  ({
    _tag: 'Remove',
  });

const render = (): Diff.Render =>
  ({
    _tag: 'Render',
  });

const __diff = GlobalValue.globalValue(
  Symbol.for('disreact/diff'),
  () => new WeakMap<any, Diff.Diff>(),
);

export const getDiff = (nd: El.El) => __diff.get(nd);

export const node = (a: El.El, b: El.El) => {
  if (Equal.equals(a, b)) {
    if (El.isComp(a)) {
      return render();
    }
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
  const polymer = Polymer.get(a);
  if (polymer.rc === 0) {
    return render();
  }
  if (!Equal.equals(a.props, b.props)) {
    return render();
  }
  if (!Equal.equals(polymer.stack, polymer.saved)) {
    return render();
  }
  return skip();
};

export const diff = (a: El.El, b: El.El) => {
  const diff = node(a, b);
  __diff.set(a, diff);
  return diff;
};

const __diffs = GlobalValue.globalValue(
  Symbol.for('disreact/diffs'),
  () => new WeakMap<any, Diff.Cd[]>(),
);

export const getDiffs = (nd: El.El) => __diffs.get(nd);

const children = (nd: El.Nd, rs: El.El[]) => {
  const acc = [] as Diff.Cd[];
  for (let i = 0; i < Math.max(nd.nodes.length, rs.length); i++) {
    const c = nd.nodes[i];
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
  return acc;
};

export const diffs = (nd: El.Nd, rs: El.El[]) => {
  const diffs = children(nd, rs);
  __diffs.set(nd, diffs);
  return diffs;
};
