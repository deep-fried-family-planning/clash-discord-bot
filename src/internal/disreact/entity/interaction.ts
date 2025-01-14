import {type RestComponent, type RestDataComponent, type RestDataDialog, type RestDataResolved, type RestMessage, RxType} from '#pure/dfx';
import {D} from '#pure/effect';
import type {IxD} from '#src/internal/discord.ts';
import type {Ix} from '#src/internal/disreact/entity/index.ts';
import type {idk, obj, str} from '#src/internal/pure/types-pure.ts';
import type {Discord} from 'dfx/index';


export type Rest =
  IxD
  & {data: RestDataDialog | RestDataComponent};


export const isRestSubmit    = (ix: Rest, data: idk): data is RestDataDialog => ix.type === RxType.MODAL_SUBMIT;
export const isRestComponent = (ix: Rest, data: idk): data is RestDataComponent => ix.type === RxType.MESSAGE_COMPONENT;


export type T = D.TaggedEnum<{
  GlobalCommand: {original: Rest; name: str; options: obj};
  ServerCommand: {original: Rest; name: str; options: obj};
  UserCommand  : {original: Rest; name: str; options: obj};
  Button       : {original: Rest; message: RestMessage; custom_id: str};
  Select       : {original: Rest; message: RestMessage; custom_id: str; values: str[]; component_type: Discord.ComponentType};
  SelectMention: {original: Rest; message: RestMessage; custom_id: str; values: str[]; component_type: Discord.ComponentType; resolved: RestDataResolved};
  Submit       : {original: Rest; message: RestMessage; custom_id: str; components: RestComponent[]};
}>;


export const T               = D.taggedEnum<T>();
export const isButton        = T.$is('Button');
export const isSelect        = T.$is('Select');
export const isSelectMention = T.$is('SelectMention');


export const decode = (ix: Ix.Rest) => {
  const data = ix.data;

  if (isRestSubmit(ix, data)) {
    return T.Submit({
      original  : ix,
      message   : ix.message!,
      custom_id : data.custom_id,
      components: data.components,
    });
  }
  if ('resolved' in data) {
    return T.SelectMention({
      original      : ix,
      message       : ix.message!,
      custom_id     : data.custom_id,
      values        : data.values as idk as str[],
      resolved      : data.resolved,
      component_type: data.component_type,
    });
  }
  if ('values' in data) {
    return T.Select({
      original      : ix,
      message       : ix.message!,
      custom_id     : data.custom_id,
      values        : data.values,
      component_type: data.component_type,
    });
  }
  return T.Button({
    original : ix,
    message  : ix.message!,
    custom_id: data.custom_id,
  });
};
