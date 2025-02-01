import * as DFMD from '#src/disreact/model/dsx/dfmd.ts';
import {button, buttons, choice, command, content, description, embed, emoji, field, footer, menu, message, modal, option, param, string, text, title, value} from '#src/disreact/model/dsx/dtml.ts';
import * as DTML from '#src/disreact/model/dsx/dtml.ts';
import {Kv, pipe} from '#src/internal/pure/effect.ts';

export {
  DFMD,
  DTML,
};


export const children = {
  [buttons]    : {button},
  [button]     : {emoji},
  [command]    : {command, param},
  [param]      : {choice},
  [content]    : {string, ...DFMD},
  [description]: {string, ...DFMD},
  [embed]      : {title, description, field, footer},
  [message]    : {content, embed, buttons, menu},
  [menu]       : {option, value},
  [modal]      : {title, text},
  [option]     : {emoji},
  [text]       : {string},
  [title]      : {string},
  ...pipe(
    DFMD,
    Kv.map(() => DFMD),
  ),
};
