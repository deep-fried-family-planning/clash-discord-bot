import {InteractionCallbackType} from 'dfx/types';
import {Any, Literal, type Schema, Struct} from 'effect/Schema';
import {ReplyType} from '.';



export const T = Struct({
  type: Literal(ReplyType.OPEN_MODAL),
  data: Any,
});

export type T = Schema.Type<typeof T>;

export const is = (self: any): self is T => self.type === InteractionCallbackType.MODAL;

export const make = (data: any): T => {
  return {
    type: InteractionCallbackType.MODAL,
    data,
  };
};
