import * as Patch from '#disreact/core/Patch.ts';
import type * as Hydrant from '#disreact/engine/entity/Hydrant.ts';
import type {Discord} from 'dfx';
import type * as Inspectable from 'effect/Inspectable';
import type * as Types from 'effect/Types';
import * as Equal from 'effect/Equal';

export type Reply = | Message
                    | Ephemeral
                    | Modal;

export interface Message {
  _tag    : 'Message';
  snapshot: Hydrant.Snapshot;
  payload : Types.DeepMutable<Discord.IncomingWebhookInteractionRequest>;
};

export interface Ephemeral  {
  _tag    : 'Ephemeral';
  snapshot: Hydrant.Snapshot;
  payload : Types.DeepMutable<Discord.IncomingWebhookInteractionRequest>;
};

export interface Modal  {
  _tag    : 'Modal';
  snapshot: Hydrant.Snapshot;
  payload : Types.DeepMutable<Discord.ModalInteractionCallbackRequestData>;
}

export const message = (snapshot: Hydrant.Snapshot): Message => {
  return {
    _tag    : 'Message',
    snapshot: snapshot,
    payload : snapshot.data,
  };
};

export const ephemeral = (snapshot: Hydrant.Snapshot): Ephemeral => {
  return {
    _tag    : 'Ephemeral',
    snapshot: snapshot,
    payload : snapshot.data,
  };
};

export const modal = (snapshot: Hydrant.Snapshot): Modal => {
  return {
    _tag    : 'Modal',
    snapshot: snapshot,
    payload : snapshot.data,
  };
};

export const diff = (self: Reply, other: Reply): Patch.Patch<Reply> => {
  if (Equal.equals(self, other)) {
    return Patch.skip(self);
  }
  return Patch.skip(self);
};
