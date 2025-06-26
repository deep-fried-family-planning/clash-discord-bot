import * as Element from '#src/disreact/codec/adaptor/exp/domain/old/element.ts';
import * as Polymer from '#src/disreact/core/polymer.ts';
import * as Equal from 'effect/Equal';
import * as GlobalValue from 'effect/GlobalValue';

export namespace Diffsv1 {
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
export type Diffs = Diffsv1.Diff;
export type Nd = Diffsv1.Nd;
export type Cd = Diffsv1.Cd;

export const isSkip = (diff: Diffsv1.Diff): diff is Diffsv1.Skip => diff._tag === 'Skip';

export const isInsert = (diff: Diffsv1.Diff): diff is Diffsv1.Insert => diff._tag === 'Insert';

export const isRemove = (diff: Diffsv1.Diff): diff is Diffsv1.Remove => diff._tag === 'Remove';

export const isReplace = (diff: Diffsv1.Diff): diff is Diffsv1.Replace => diff._tag === 'Replace';

export const isUpdate = (diff: Diffsv1.Diff): diff is Diffsv1.Update => diff._tag === 'Update';

export const isRender = (diff: Diffsv1.Diff): diff is Diffsv1.Render => diff._tag === 'Render';

const skip = (): Diffsv1.Skip =>
  ({
    _tag: 'Skip',
  });

const replace = (node: Element.Element): Diffsv1.Replace =>
  ({
    _tag: 'Replace',
    node,
  });

const update = (node: Element.Element): Diffsv1.Update =>
  ({
    _tag: 'Update',
    node,
  });

const insert = (node: Element.Element): Diffsv1.Insert =>
  ({
    _tag: 'Insert',
    node,
  });

const remove = (): Diffsv1.Remove =>
  ({
    _tag: 'Remove',
  });

const render = (): Diffsv1.Render =>
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
  if (Element.isFunc(a)) {
    if (Element.isFunc(b)) {
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
  if (!n.under?.length) {
    const acc = [] as Diffsv1.Cd[];
    for (const r of rs) {
      acc.push(insert(r));
    }
    diffs.set(n, acc);
    return acc;
  }

  const acc = [] as Diffsv1.Cd[];
  const len = Math.max(n.under?.length ?? 0, rs.length);

  for (let i = 0; i < len; i++) {
    const c = n.under![i];
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
