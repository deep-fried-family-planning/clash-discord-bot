import * as DAPI from '#src/disreact/codec/wire/dapi.ts';
import {ForbiddenSync, RedactionTerminus} from '#src/disreact/codec/wire/shared/shared.ts';
import {Literal, optional, Struct, transform, Union} from 'effect/Schema';
import {CallbackType} from 'src/disreact/codec/enum/index.ts';
import * as Doken from '#src/disreact/codec/wire/abstract/doken.ts';
import * as dapi from '#src/disreact/codec/wire/resource/index.ts';



export const Discard = Struct({
  id   : dapi.InteractionId,
  token: RedactionTerminus,
  body : Struct({
    type: Literal(CallbackType.UPDATE),
  }),
});



export const CreateModal = Struct({
  id   : dapi.InteractionId,
  token: RedactionTerminus,
  body : Struct({
    type: Literal(CallbackType.MODAL),
    data: DAPI.Modal,
  }),
});

export const CreatePrivate = Struct({
  id   : dapi.InteractionId,
  token: RedactionTerminus,
  body : Struct({
    type: CallbackType.Spent,
    data: Struct({
      ...DAPI.BaseMessage.fields,
      flags: Literal(64),
    }),
  }),
});

export const CreatePublic = Struct({
  id   : dapi.InteractionId,
  token: RedactionTerminus,
  body : Struct({
    type: CallbackType.Spent,
    data: DAPI.BaseMessage.omit('flags'),
  }),
});

export const Create = Union(
  CreateModal,
  CreatePrivate,
  CreatePublic,
);



export const DeferPrivate = Struct({
  id   : dapi.InteractionId,
  token: RedactionTerminus,
  body : Struct({
    type: CallbackType.Defer,
    data: Struct({
      flags: Literal(64),
    }),
  }),
});

export const DeferPublic = Struct({
  id   : dapi.InteractionId,
  token: RedactionTerminus,
  body : Struct({
    type: CallbackType.Defer,
  }),
});

export const Defer = Union(
  DeferPrivate,
  DeferPublic,
);



export const ReplyPrivate = Struct({
  app  : RedactionTerminus,
  token: RedactionTerminus,
  body : DAPI.BaseMessage,
});

export const ReplyPublic = Struct({
  app  : RedactionTerminus,
  token: RedactionTerminus,
  body : DAPI.BaseMessage,
});

export const Reply = Union(
  ReplyPrivate,
  ReplyPublic,
);



export const Update = Struct({
  app  : RedactionTerminus,
  token: RedactionTerminus,
  body : DAPI.BaseMessage,
});



export const Dismount = Struct({
  app  : RedactionTerminus,
  token: RedactionTerminus,
});



export type Discard = typeof Discard.Encoded;
export type Create = typeof Create.Encoded;
export type Defer = typeof Defer.Encoded;
export type Reply = typeof Reply.Encoded;
export type Update = typeof Update.Encoded;
export type Dismount = typeof Dismount.Encoded;



export const DiscardFromFreshDoken = transform(
  Discard,
  Doken.FreshValid,
  {
    decode: ForbiddenSync,
    encode: (fresh) =>
      ({
        id   : fresh.id,
        token: fresh.val,
        body : {
          type: CallbackType.UPDATE,
        },
      }),
  },
);

export const CreateFromDokenMessage = transform(
  Create,
  Struct({
    fresh  : Doken.FreshValid,
    message: optional(DAPI.BaseMessage),
    modal  : optional(DAPI.Modal),
  }),
  {
    decode: ForbiddenSync,
    encode: ({fresh, message, modal}) =>
      ({
        id   : fresh.id,
        token: fresh.val,
        body:
          modal
            ? {
              type: CallbackType.MODAL,
              data: modal,
            }
            : message
              ? {
                type: fresh.type as any,
                data: message.flags && (message.flags & 64)
                  ? {...message, flags: 64}
                  : message,
              }
              : {
                type: fresh.type,
                data: {},
              } as any,
      }),
  },
);

export const DismountFromFresh = transform(
  Dismount,
  Doken.FreshValid,
  {
    strict: false,
    decode: ForbiddenSync,
    encode: (fresh) =>
      ({
        app  : fresh.app,
        token: fresh.val,
      }),
  },
);
