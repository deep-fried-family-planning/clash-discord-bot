import {children, key, onClick, onDeselect, onSelect, onSubmit, ref} from '#src/disreact/dsx/dattributes.ts';
import {a, at, b, blockquote, br, code, details, h1, h2, h3, i, li, mask, ol, p, pre, s, small, u, ul} from '#src/disreact/dsx/dfmd.ts';
import {button, buttons, choice, command, content, description, embed, emoji, field, footer, menu, message, modal, option, param, string, text, title, value} from '#src/disreact/dsx/dtml.ts';



export const children_allowlist = {
  [string]: {},

  [command]    : {[command]: 1, [param]: 25},
  [param]      : {[choice]: 25},
  [choice]     : {},
  [buttons]    : {[button]: 5},
  [button]     : {[emoji]: 1},
  [menu]       : {[option]: 25, [value]: 25},
  [option]     : {},
  [value]      : {},
  [emoji]      : {},
  [text]       : {},
  [message]    : {},
  [content]    : {},
  [modal]      : {},
  [embed]      : {[title]: 1, [description]: 1, [field]: 25, [footer]: 1},
  [title]      : {[string]: 1},
  [description]: {[string]: 1},
  [field]      : {},
  [footer]     : {},

  [at]        : {},
  [a]         : {[mask]: 1},
  [mask]      : {},
  [p]         : {},
  [br]        : {},
  [b]         : {},
  [i]         : {},
  [u]         : {},
  [s]         : {},
  [details]   : {},
  [code]      : {},
  [pre]       : {[string]: null, [code]: null},
  [blockquote]: {},
  [h1]        : {},
  [h2]        : {},
  [h3]        : {},
  [small]     : {},
  [ol]        : {[li]: null},
  [ul]        : {[li]: null},
  [li]        : {},
};

export const encode_denylist = {
  [onClick]   : null,
  [onSelect]  : null,
  [onDeselect]: null,
  [onSubmit]  : null,
  [children]  : null,
  [ref]       : null,
  [key]       : null,
};
