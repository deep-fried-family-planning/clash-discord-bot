import {$a, $at, $b, $blockquote, $br, $code, $details, $h1, $h2, $h3, $i, $li, $mask, $ol, $p, $pre, $s, $small, $timestamp, $u, $ul} from '#src/disreact/codec/abstract/dfmd.ts';
import {$actions, $author, $channels, $danger, $default, $dialog, $embed, $emoji, $field, $footer, $image, $link, $mentions, $message, $modal, $option, $premium, $primary, $roles, $secondary, $select, $success, $text, $textarea, $thumbnail, $users, $video} from '#src/disreact/codec/abstract/dtml.ts';
import {S} from '#src/internal/pure/effect.ts';
import * as Array from 'effect/Array';
import {transformLiterals, Union} from 'effect/Schema';
import * as In from '#src/disreact/codec/schema/api-input.ts';
import * as Out from '#src/disreact/codec/schema/api-output.ts';
import * as Common from 'src/disreact/codec/schema/shared.ts';
import * as Path from './path.ts';
import * as Intrinsic from '#src/disreact/codec/schema/dom-intrinsic.ts';
import * as DOMEvent from 'src/disreact/codec/schema/dom-event.ts';
export * as In from '#src/disreact/codec/schema/api-input.ts';
export * as Out from '#src/disreact/codec/schema/api-output.ts';
export * as DOMEvent from 'src/disreact/codec/schema/dom-event.ts';
export * as Common from 'src/disreact/codec/schema/shared.ts';
export * as Path from './path.ts';
export * as Routing from '#src/disreact/codec/schema/frame.ts';

export const _internal = {
  In,
  Out,
  Common,
  Path,
  DOMEvent,
};

export const decodeApiInputInteraction = S.decodeUnknownSync(In.Interaction);


export const Event = Union(
  DOMEvent.CommandSubmit,
  DOMEvent.MessageSubmit,
  DOMEvent.Button,
  DOMEvent.StringSelect,
  DOMEvent.UserSelect,
  DOMEvent.RoleSelect,
  DOMEvent.ChannelSelect,
  DOMEvent.MentionSelect,
  DOMEvent.SlashCommand,
  DOMEvent.UserCommand,
  DOMEvent.MessageCommand,
  DOMEvent.AutoComplete,
);
