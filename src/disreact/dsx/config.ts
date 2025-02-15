import {children, key, onautocomplete, onclick, ondeselect, oninvoke, onselect, onsubmit, ref} from '#src/disreact/dsx/attributes.ts';
import {a, at, b, blockquote, br, code, details, h1, h2, h3, i, li, mask, ol, p, pre, s, small, u, ul} from '#src/disreact/dsx/dfmd.ts';
import {button, buttons, choice, command, content, description, dialog, embed, emoji, field, footer, menu, message, modal, option, param, string, text, title, value} from '#src/disreact/dsx/dtml.ts';


const inf = Infinity;
// |  |
// | --- |
//
// let λ, φ, τ, π;

export const children_allowlist = {
  [string]: {},

  [command]    : {[command]: [0, 1], [param]: [0, 25]},
  [param]      : {[choice]: [0, 25]},
  [choice]     : {},
  [buttons]    : {[button]: [1, 5]},
  [button]     : {[emoji]: [0, 1]},
  [menu]       : {[option]: [1, 25], [value]: 25},
  [option]     : {[emoji]: [0, 1]},
  [value]      : {},
  [emoji]      : {},
  [text]       : {},
  [message]    : {[content]: [0, 1], [embed]: [0, 10]},
  [content]    : {},
  [modal]      : {[text]: [1, 5]},
  [dialog]     : {[text]: [1, 5]},
  [embed]      : {[title]: [0, 1], [description]: [0, 1], [field]: [0, 25], [footer]: [0, 1]},
  [title]      : {[string]: [0, 1]},
  [description]: {[string]: [0, 1]},
  [field]      : {},
  [footer]     : {},

  [at]        : {},
  [a]         : {[mask]: [0, 1]},
  [mask]      : {},
  [p]         : {},
  [br]        : {},
  [b]         : {},
  [i]         : {},
  [u]         : {},
  [s]         : {},
  [details]   : {},
  [code]      : {},
  [pre]       : {[string]: [1, inf], [code]: [1, inf]},
  [blockquote]: {},
  [h1]        : {},
  [h2]        : {},
  [h3]        : {},
  [small]     : {},
  [ol]        : {[li]: [1, inf]},
  [ul]        : {[li]: [1, inf]},
  [li]        : {},
};

export const encode_denylist = {
  [onclick]       : null,
  [onselect]      : null,
  [ondeselect]    : null,
  [onsubmit]      : null,
  [onautocomplete]: null,
  [oninvoke]      : null,
  [children]      : null,
  [ref]           : null,
  [key]           : null,
};
