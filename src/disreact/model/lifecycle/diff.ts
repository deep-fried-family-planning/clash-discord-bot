import * as El from '#src/disreact/model/entity/element.ts';
import * as Polymer from '#src/disreact/model/entity/polymer.ts';
import {Differ, Either, Predicate} from 'effect';
import * as Equal from 'effect/Equal';
import {pipe} from 'effect/Function';
import * as GlobalValue from 'effect/GlobalValue';
import * as Boolean from 'effect/Boolean';
import console from 'node:console';

export namespace Diff {
  export type Skip = {
    _tag: 'Skip';
  };
  export type Insert = {
    _tag: 'Insert';
    node: El.Element;
  };
  export type Remove = {
    _tag: 'Remove';
  };
  export type Replace = {
    _tag: 'Replace';
    node: El.Element;
  };
  export type Update = {
    _tag: 'Update';
    node: El.Element;
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

const replace = (node: El.Element): Diff.Replace =>
  ({
    _tag: 'Replace',
    node,
  });

const update = (node: El.Element): Diff.Update =>
  ({
    _tag: 'Update',
    node,
  });

const insert = (node: El.Element): Diff.Insert =>
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

const __diff = GlobalValue
  .globalValue(Symbol.for('disreact/diff'), () => new WeakMap<El.Element, Diff>());

export const node = (a: El.Element, b: El.Element) => {
  if (Equal.equals(a, b)) {
    return skip();
  }
  if (a.type !== b.type) {
    return replace(b);
  }
  if (El.isText(a) || El.isText(b)) {
    return update(b);
  }
  if (El.isRest(a) || El.isRest(b)) {
    return update(b);
  }
  const poly = Polymer.get(a);
  if (poly.rc === 0) {
    return render();
  }
  if (!Equal.equals(a.props, b.props)) {
    return render();
  }
  if (!Equal.equals(poly.curr, poly.save)) {
    return render();
  }
  return skip();
};

const diffs = GlobalValue
  .globalValue(Symbol.for('disreact/diffs'), () => new WeakMap<any, Cd[]>());

export const nodes = (n: El.Element) => diffs.get(n);

export const rendered = (n: El.Element, rs?: El.Element[]) => {
  if (rs === undefined) {
    diffs.set(n, []);
    return [];
  }

  const acc = [] as Diff.Cd[];
  const len = Math.max(n.rs?.length ?? 0, rs.length);

  for (let i = 0; i < len; i++) {
    const c = n.rs![i];
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
  diffs.set(n, acc);
  return acc;
};
