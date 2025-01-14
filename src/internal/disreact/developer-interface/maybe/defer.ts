import {D, E, g} from '#pure/effect';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import type {Ix} from '#src/internal/disreact/entity/index.ts';
import {type bool, cannot} from '#src/internal/pure/types-pure.ts';


export type T = D.TaggedEnum<{
  None             : {ix: Ix.Rest; done?: bool};
  EntrypointCreate : {ix: Ix.Rest; done?: bool};
  EntrypointUpdate : {ix: Ix.Rest; done?: bool};
  EphemeralCreate  : {ix: Ix.Rest; done?: bool};
  EphemeralFollowup: {ix: Ix.Rest; done?: bool};
  EphemeralUpdate  : {ix: Ix.Rest; done?: bool};
  DialogOpen       : {ix: Ix.Rest; done?: bool};
  DialogSubmit     : {ix: Ix.Rest; done?: bool};
}>;


const T                        = D.taggedEnum<T>();
const match                    = T.$match;
export const None              = T.None;
export const EntrypointCreate  = T.EntrypointCreate;
export const EntrypointUpdate  = T.EntrypointUpdate;
export const EphemeralCreate   = T.EphemeralCreate;
export const EphemeralFollowup = T.EphemeralFollowup;
export const EphemeralUpdate   = T.EphemeralUpdate;
export const DialogOpen        = T.DialogOpen;
export const DialogSubmit      = T.DialogSubmit;


const getCall = match({
  None             : () => cannot(E.void),
  EntrypointCreate : (self) => DiscordApi.deferEntry(self.ix),
  EntrypointUpdate : () => E.void,
  EphemeralCreate  : (self) => DiscordApi.deferEntryEphemeral(self.ix),
  EphemeralFollowup: () => E.void,
  EphemeralUpdate  : (self) => DiscordApi.deferUpdate(self.ix),
  DialogOpen       : () => E.void,
  DialogSubmit     : (self) => DiscordApi.deferUpdate(self.ix),
});


export const execute = (_defer: T) => g(function * () {
  if (!_defer.done) {
    yield * getCall(_defer);
    return T[_defer._tag]({
      ix  : _defer.ix,
      done: true,
    });
  }
  return yield * noFix();
});
