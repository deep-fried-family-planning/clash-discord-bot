import {Any, Literal, mutable, type Schema, Struct} from 'effect/Schema';
import {ReplyFlag, ReplyType} from '.';



export const T = mutable(Struct({
  flag: Literal(
    ReplyFlag.EPHEMERAL,
    ReplyFlag.ENTRYPOINT,
  ),
  type: Literal(
    ReplyType.SOURCE,
    ReplyType.SOURCE_DEFER,
    ReplyType.UPDATE,
    ReplyType.UPDATE_DEFER,
  ),
  data: Any,
}));

export type T = Schema.Type<typeof T>;
