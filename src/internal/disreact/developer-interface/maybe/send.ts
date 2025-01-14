import type {RestDialog, RestMessage} from '#pure/dfx';
import {D} from '#pure/effect';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import type {Ix} from '#src/internal/disreact/entity/index.ts';
import type {bool, opt} from '#src/internal/pure/types-pure.ts';


export type T = D.TaggedEnum<{
  Close   : {ix: Ix.Rest};
  Create  : {ix: Ix.Rest; immediate?: bool; payload: opt<RestMessage>};
  Start   : {ix: Ix.Rest; immediate?: bool; payload: opt<RestMessage>};
  Update  : {ix: Ix.Rest; immediate?: bool; payload: opt<RestMessage>};
  Followup: {ix: Ix.Rest; immediate?: bool; payload: opt<RestMessage>};
  Open    : {ix: Ix.Rest; immediate?: bool; payload: RestDialog};
}>;


export const T        = D.taggedEnum<T>();
export const Close    = T.Close;
export const Create   = T.Create;
export const Start    = T.Create;
export const Update   = T.Update;
export const Followup = T.Followup;
export const Open     = T.Open;


export const execute = T.$match({
  Close   : (self) => DiscordApi.deleteMenu(self.ix),
  Create  : (self) => self.immediate ? DiscordApi.entryMenu(self.ix, self.payload as never) : DiscordApi.editMenu(self.ix, self.payload as never),
  Start   : (self) => self.immediate ? DiscordApi.entryMenu(self.ix, self.payload as never) : DiscordApi.editMenu(self.ix, self.payload as never),
  Update  : (self) => self.immediate ? DiscordApi.entryMenu(self.ix, self.payload as never) : DiscordApi.editMenu(self.ix, self.payload as never),
  Followup: () => fixMe('how to deal with 6+ messages'),
  Open    : (self) => DiscordApi.openDialog(self.ix, self.payload),
});
