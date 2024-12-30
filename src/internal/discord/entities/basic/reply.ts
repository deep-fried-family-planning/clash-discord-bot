import {NONE} from '#discord/entities/constants/path.ts';
import type {IxIn} from '#discord/types.ts';
import type {RestComponent, RestEmbed} from '#pure/dfx';
import {D} from '#pure/effect';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import type {str} from '#src/internal/pure/types-pure.ts';


export type T = D.TaggedEnum<{
  Dialog : {custom_id: str; title: str; components: RestComponent[]};
  Message: {embeds: RestEmbed[]; components: RestComponent[]};
}>;

export const E     = D.taggedEnum<T>();
export const is    = E.$is;
export const match = E.$match;


export const Dialog  = E.Dialog;
export const Message = E.Message;


export const DialogEmpty = () => Dialog({
  custom_id : NONE,
  title     : NONE,
  components: [],
});


export const MessageEmpty = () => Message({
  embeds    : [],
  components: [],
});


export const reply = (ix: IxIn) => match({
  Dialog : (tx) => DiscordApi.openModal(ix, tx),
  Message: (tx) => DiscordApi.editMenu(ix, tx),
});
