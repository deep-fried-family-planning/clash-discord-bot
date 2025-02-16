import * as In from '#src/disreact/codec/schema/api-input.ts';
import * as Out from '#src/disreact/codec/schema/api-output.ts';
import {S} from '#src/internal/pure/effect.ts';

import * as DOMEvent from 'src/disreact/codec/schema/dom-event.ts';
import * as Common from 'src/disreact/codec/schema/shared.ts';

export * as In from '#src/disreact/codec/schema/api-input.ts';
export * as Out from '#src/disreact/codec/schema/api-output.ts';
export * as DOMEvent from 'src/disreact/codec/schema/dom-event.ts';
export * as Common from 'src/disreact/codec/schema/shared.ts';
export * as Routing from '#src/disreact/codec/schema/frame.ts';

export const _internal = {
  In,
  Out,
  Common,
  DOMEvent,
};

export const decodeApiInputInteraction = S.decodeUnknownSync(In.Interaction);
