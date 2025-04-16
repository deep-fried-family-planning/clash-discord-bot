import {Elem} from '#src/disreact/model/elem/elem.ts';
import {Fibril} from '#src/disreact/model/meta/fibril.ts';
import {Data} from '#src/disreact/utils/re-exports.ts';
import {Props} from 'src/disreact/model/elem/props.ts';

export * as Diffs from '#src/disreact/model/meta/diffs.ts';
export type Diffs = Data.TaggedEnum<{
  Skip    : {};
  Set     : {};
  Update  : {};
  Jump    : {};
  Next    : {};
  Mount   : {};
  Dismount: {};
  Replace : {};
  Render  : {elem: Elem.Task};
}>;
const tags = Data.taggedEnum<Diffs>();

export const Skip     = tags.Skip,
             Set      = tags.Set,
             Update   = tags.Update,
             Jump     = tags.Jump,
             Next     = tags.Next,
             Mount    = tags.Mount,
             Dismount = tags.Dismount,
             Replace  = tags.Replace,
             Render   = tags.Render;

const value = (a: Elem.Value, b: Elem) => {
  if (Elem.isValue(b)) {
    if (a === b) {
      return Skip();
    }
    return Set();
  }
  return Replace();
};

const fragment = (a: Elem.Fragment, b: Elem) => {
  if (Elem.isValue(b)) {
    return Set();
  }
  if (Elem.isFragment(b)) {
    return Update();
  }
  return Replace();
};

const rest = (a: Elem.Rest, b: Elem) => {
  if (Elem.isValue(b)) {
    return Set();
  }
  if (Elem.isRest(b)) {
    if (a.type !== b.type) {
      return Replace();
    }
    if (!Props.isEqual(a.props, b.props)) {
      return Update();
    }
    return Next();
  }
  return Replace();
};

const task = (a: Elem.Task, b: Elem) => {
  if (Elem.isValue(b)) {
    return Set();
  }
  if (Elem.isTask(b)) {
    if (a.type !== b.type) {
      return Replace();
    }
    if (!Props.isEqual(a.props, b.props)) {
      return Render({elem: a});
    }
    if (!Fibril.isSame(a.fibril)) {
      return Render({elem: a});
    }
    return Skip();
  }
  return Replace();
};

const elem = (a: Elem, b: Elem) => {
  if (!a && !b) {
    return Skip();
  }
  if (a === b) {
    return Skip();
  }
  if (!a && b) {
    return Mount();
  }
  if (a && !b) {
    return Dismount();
  }
  if (Elem.isValue(a)) {
    return value(a, b);
  }
  if (Elem.isFragment(a)) {
    return fragment(a, b);
  }
  if (Elem.isRest(a)) {
    return rest(a, b);
  }
  if (Elem.isTask(a)) {
    return task(a, b);
  }
  return Skip();
};
