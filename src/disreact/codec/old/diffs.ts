import * as Element from '#src/disreact/model/internal/core/element.ts';
import * as Polymer from '#src/disreact/model/internal/polymer.ts';
import * as Equal from 'effect/Equal';
import * as GlobalValue from 'effect/GlobalValue';

export namespace Diff {
  export type Skip = {
    _tag: 'Skip';
  };
  export type Insert = {
    _tag: 'Insert';
    node: Element.Element;
  };
  export type Remove = {
    _tag: 'Remove';
  };
  export type Replace = {
    _tag: 'Replace';
    node: Element.Element;
  };
  export type Update = {
    _tag: 'Update';
    node: Element.Element;
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
export type Diffs = Diff.Diff;
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

const replace = (node: Element.Element): Diff.Replace =>
  ({
    _tag: 'Replace',
    node,
  });

const update = (node: Element.Element): Diff.Update =>
  ({
    _tag: 'Update',
    node,
  });

const insert = (node: Element.Element): Diff.Insert =>
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
  .globalValue(Symbol.for('disreact/diff'), () => new WeakMap<Element.Element, Diffs>());

export const node = (a: Element.Element, b: Element.Element) => {
  if (Element.isText(a)) {
    if (Element.isText(b)) {
      return update(b);
    }
    return replace(b);
  }
  if (Element.isRest(a)) {
    if (Element.isRest(b)) {
      return update(b);
    }
    return replace(b);
  }
  if (Element.isComp(a)) {
    if (Element.isComp(b)) {
      const poly = Polymer.get(a);
      if (poly.rc === 0) {
        return render();
      }
      if (!Equal.equals(a.props, b.props)) {
        return render();
      }
      if (!Equal.equals(poly.stack, poly.saved)) {
        return render();
      }
      return skip();
    }
    return replace(b);
  }
  return skip();
};

const diffs = GlobalValue
  .globalValue(Symbol.for('disreact/diffs'), () => new WeakMap<any, Cd[]>());

export const nodes = (n: Element.Element) => diffs.get(n);

export const rendered = (n: Element.Element, rs?: Element.Element[]) => {
  if (rs === undefined) {
    diffs.set(n, []);
    return [];
  }
  if (!n.rs?.length) {
    const acc = [] as Diff.Cd[];
    for (const r of rs) {
      acc.push(insert(r));
    }
    diffs.set(n, acc);
    return acc;
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
