import {FC} from '#src/disreact/model/component/fc.ts';
import {FiberStore} from '#src/disreact/model/fiber/fiber-store.ts';
import type {Hydrant} from '#src/disreact/model/fiber/hydrant.ts';
import {Element} from '#src/disreact/model/element/element.ts';



export interface Root {
  _tag   : Root.T;
  id     : Hydrant.Id;
  element: Element.Any;
  store  : FiberStore;
}

export namespace Root {
  export const enum T {
    Modal   = 'Modal',
    Message = 'Message',
  }

  export interface Origin {
    _tag   : Root.T;
    id     : string;
    element: Element.Any;
  }

  export const make = (_tag: Root.T, orFC: Element.OrFC): Origin => {
    const element = FC.is(orFC)
      ? Element.Task.make(orFC, undefined)
      : orFC;

    if (Element.Task.is(element)) {
      FC.initRoot(element.type);

      element.id = FC.getRootId(element.type);
    }

    return {
      _tag,
      id: element.id,
      element,
    };
  };

  export const clone = (origin: Origin, props?: any): Root => {
    const element   = Element.clone(origin.element);
    const store     = FiberStore.make(origin.id, props);
    const full_id   = `${element.id}:${element.idx}`;
    element.full_id = full_id;

    if (Element.Task.is(element)) {
      element.fiber.root    = store;
      element.fiber.element = element;
      element.fiber.id      = element.full_id;
      store.fibers[full_id] = element.fiber;
    }

    store.element = {
      _tag: origin._tag,
      id  : element.id,
      element,
      store,
    };

    return store.element;
  };

  export const cloneWith = (origin: Origin, hydrant: Hydrant) => {
    const cloned = clone(origin, hydrant.props);

    cloned.store = FiberStore.decode(origin.id, hydrant);

    return cloned;
  };
}
