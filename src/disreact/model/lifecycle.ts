import {FC} from '#src/disreact/model/entity/fc.ts';
import type {TaskElement} from '#src/disreact/model/entity/task-element.ts';
import type {Root} from '#src/disreact/model/root.ts';
import {E} from '#src/internal/pure/effect.ts';
import {isPromise} from 'effect/Predicate';



export const renderTask = (root: Root, element: TaskElement) => {
  element.fiber.pc      = 0;
  element.fiber.element = element;
  element.fiber.root    = root.store;
  delete root.store.fibers[element.id];
  root.store.fibers[element.id] = element.fiber;

  if (FC.isSync(element.type)) {
    return E.succeed(element.type(element.props));
  }
  if (FC.isAsync(element.type)) {
    return E.tryPromise(async () => await element.type(element.props)) as E.Effect<any>;
  }
  if (FC.isEffect(element.type)) {
    return element.type(element.props) as E.Effect<any>;
  }

  return E.suspend(() => {
    const children = element.type(element.props);

    if (isPromise(children)) {
      element.type[FC.Render] = FC.ASYNC;

      return E.tryPromise(async () => await children) as E.Effect<any>;
    }

    if (E.isEffect(children)) {
      element.type[FC.Render] = FC.EFFECT;

      return children as E.Effect<any>;
    }

    element.type[FC.Render] = FC.SYNC;

    return E.succeed(children);
  });
};
