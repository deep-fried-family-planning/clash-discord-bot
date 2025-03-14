import type {FC} from '#src/disreact/model/component/fc.ts';
import {RestElement} from '#src/disreact/model/element/rest-element.ts';
import {TaskElement} from '#src/disreact/model/element/task-element.ts';
import {TextElement} from '#src/disreact/model/element/text-element.ts';



export type Element = Element.Any;

export namespace Element {
  export type Rest = RestElement;
  export type Task = TaskElement;
  export type Text = TextElement;

  export type Any =
    | RestElement
    | TaskElement
    | TextElement;

  export interface Meta {
    id     : string;
    idx    : number;
    step_id: string;
    full_id: string;
  }

  export const enum Tag {
    REST = 'RestElement',
    TASK = 'TaskElement',
    TEXT = 'TextElement',
  }

  export type OrFC = Any | FC.FC;

  export const Fragment = undefined;
  export const Rest     = RestElement;
  export const Task     = TaskElement;
  export const Text     = TextElement;

  export const make = (type: any, props: any) => {
    switch (typeof type) {
      case 'undefined': {
        return props.children;
      }

      case 'string': {
        return Rest.make(type, props);
      }

      case 'function': {
        return Task.make(type, props);
      }

      case 'symbol':
      case 'boolean':
      case 'number':
      case 'bigint': {
        throw new Error();
      }
    }
  };

  export const clone = <A extends Element>(element: A): A => {
    if (Text.is(element)) {
      return Text.clone(element) as A;
    }
    if (Rest.is(element)) {
      return Rest.clone(element) as A;
    }
    return Task.clone(element) as A;
  };

  export const isSame = (a: Any, b: Any): boolean => {
    if (a === b) {
      return true;
    }
    if (a._tag !== b._tag) {
      return false;
    }
    if (a.constructor !== b.constructor) {
      return false;
    }
    return true;
  };

  export const connectParent = (self: Any, parent: Any) => {
    self.step_id = `${parent.step_id}:${self.id}:${self.idx}`;
    self.full_id = `${parent.full_id}:${self.id}:${self.idx}`;
  };
}
