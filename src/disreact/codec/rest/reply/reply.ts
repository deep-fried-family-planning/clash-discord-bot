import {Union} from 'effect/Schema';
import {DialogReply, MessageReply} from '.';



export const T = Union(
  DialogReply.T,
  MessageReply.T,
);
