import {Arr, Int, SnowFlake, Str} from '#src/disreact/codec/schema/shared.ts';
import {E} from '#src/internal/pure/effect.ts';
import {mapInputInEffect} from 'effect/Channel';
import {Any, Array, DateTimeUtcFromNumber, decodeSync, encodeSync, length, Literal, maxLength, minItems, minLength, mutable, NumberFromString, optional, parseNumber, Record, Redacted, type Schema, StringFromBase64Url, Struct, SymbolFromSelf, tag, TemplateLiteralParser, transformLiterals, Union, UUID} from 'effect/Schema';
import * as Event from './dom-event.ts';



export const DRVersion = '/0/0/0/';
export const RoutingVersion = '/0/0/0/';


// lmao
export const PreExistingCondition = transformLiterals(
  ['0', 'Any'],
  ['1', 'Message'],
  ['2', 'Dialog'],
);
export const KnownRestriction = PreExistingCondition;

export const UsageConstraint = transformLiterals(
  ['0', 'None'],
  ['1', 'Exp'],
  ['2', 'Inc'],
  ['3', 'Ack'],
  ['4', 'Ent'],
  ['5', 'Pub'],
  ['6', 'Eph'],
);

export const IntrinsicConstraint = transformLiterals(
  ['0', 'Message'],
  ['2', 'Both'],
);

export const Doken = mutable(Struct({
  _tag       : tag('Doken'),
  id         : SnowFlake,
  doken      : Redacted(Str),
  ttl        : DateTimeUtcFromNumber,
  clk        : optional(DateTimeUtcFromNumber),
  defer      : optional(Int),
  constraints: Struct({
    known   : KnownRestriction,
    usage   : UsageConstraint,
    imply   : IntrinsicConstraint,
    app_id  : SnowFlake,
    user_id : SnowFlake,
    guild_id: Union(SnowFlake),
  }),
}));



export const CustomIdRoutingTemplate = TemplateLiteralParser(
  Literal('dr'),
  Str.pipe(length(1), parseNumber),
  Str.pipe(length(1), parseNumber),
  Str.pipe(length(19)),
  Str.pipe(minLength(0), maxLength(76)),
);

export const CustomIdParams = Struct({
  _tag: tag('CustomIdParams'),
  row : NumberFromString,
  col : NumberFromString,
  id  : Str,
  last: optional(Str),
});



export const MessageRoutingTemplate = TemplateLiteralParser(
  Literal('/dr/'),
  KnownRestriction,
  UsageConstraint,
  IntrinsicConstraint,
  Str.pipe(length(19)),
  StringFromBase64Url,
  Literal(DRVersion),
  StringFromBase64Url,
  Literal(RoutingVersion),
);

export const MessageRouting = Struct({
  _tag     : tag('MessageRouteFrame'),
  root     : Str,
  doken    : Doken,
  hydration: Record({
    key  : Str,
    value: Arr(Any).pipe(minItems(1)),
  }),
});



export const DialogRoutingTemplate = TemplateLiteralParser(
  Literal('/dr/'),
  KnownRestriction,
  UsageConstraint,
  IntrinsicConstraint,
);

export const DialogRouteFrame = Struct({
  _tag  : tag('DialogRouteFrame'),
  root  : Str,
  dialog: Str,
  doken : Doken,
});



const CommonRouteFrame = Struct({
  pointer   : SymbolFromSelf,
  pointerId : SnowFlake,
  relayId   : optional(UUID),
  clockStart: DateTimeUtcFromNumber,
  clockGiven: optional(DateTimeUtcFromNumber),
  clockCheck: DateTimeUtcFromNumber,
  rest      : Any,
  context   : Struct({
    main      : Any,
    components: Any,
  }),
});


export const Frame = Union(
  Struct({
    ...CommonRouteFrame.fields,
    _tag   : tag('MessageComponentFrame'),
    routing: MessageRouting,
    event  : Union(
      Event.Button,
      Event.StringSelect,
      Event.UserSelect,
      Event.RoleSelect,
      Event.ChannelSelect,
    ),
  }),
  Struct({
    ...CommonRouteFrame.fields,
    _tag   : tag('DialogSubmitFrame'),
    routing: DialogRouteFrame,
    event  : Union(
      Event.MessageSubmit,
    ),
  }),
);



export const encodeCustomIdRoutingTemplate = encodeSync(CustomIdRoutingTemplate);
export const encodeMessageRoutingTemplate = encodeSync(MessageRoutingTemplate);
export const encodeDialogRoutingTemplate = encodeSync(DialogRoutingTemplate);
export const decodeCustomIdRoutingTemplate = decodeSync(CustomIdRoutingTemplate);
export const decodeMessageRoutingTemplate = decodeSync(MessageRoutingTemplate);
export const decodeDialogRoutingTemplate = decodeSync(DialogRoutingTemplate);


export type PreExistingCondition = Schema.Type<typeof PreExistingCondition>;
export type KnownRestriction = Schema.Type<typeof KnownRestriction>;
export type UsageConstraint = Schema.Type<typeof UsageConstraint>;
export type ImpliedConstraint = Schema.Type<typeof IntrinsicConstraint>;
export type Doken = Schema.Type<typeof Doken>;
export type CustomIdRoutingTemplate = Schema.Type<typeof CustomIdRoutingTemplate>;
export type CustomIdParams = Schema.Type<typeof CustomIdParams>;
export type MessageRoutingRoutingTemplate = Schema.Type<typeof MessageRoutingTemplate>;
export type MessageRoutingParams = Schema.Type<typeof MessageRouting>;
export type DialogRoutingRoutingTemplate = Schema.Type<typeof DialogRoutingTemplate>;
export type DialogRoutingParams = Schema.Type<typeof DialogRouteFrame>;
export type Frame = Schema.Type<typeof Frame>;
