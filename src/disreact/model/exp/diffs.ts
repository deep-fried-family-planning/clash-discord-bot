import {Data} from 'effect';
import {Elem} from '#src/disreact/model/elem/elem.ts';
import {Props} from '#src/disreact/model/elem/props.ts';
import {Fibril} from '#src/disreact/model/meta/fibril.ts';

type Diffs = Data.TaggedEnum<{
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

const Skip     = tags.Skip,
      Set      = tags.Set,
      Update   = tags.Update,
      Jump     = tags.Jump,
      Next     = tags.Next,
      Mount    = tags.Mount,
      Dismount = tags.Dismount,
      Replace  = tags.Replace,
      Render   = tags.Render;

const diff = (a: Elem, b: Elem) => {
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
    if (Elem.isValue(b)) {
      if (a === b) {
        return Skip();
      }
      return Set();
    }
    return Replace();
  }

  if (Elem.isFragment(a)) {
    if (Elem.isValue(b)) {
      return Set();
    }
    if (Elem.isFragment(b)) {
      return Update();
    }
    return Replace();
  }

  if (Elem.isRest(a)) {
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
  }

  if (Elem.isTask(a)) {
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
  }

  return Skip();
};
