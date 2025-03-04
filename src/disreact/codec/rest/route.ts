import * as Doken from '#src/disreact/codec/rest/doken.ts';
import {decodeSync, encodeSync, mutable, NumberFromString, type Schema, String, Struct, TemplateLiteralParser, transform} from 'effect/Schema';



export const Params =
               mutable(Struct({
                 origin: String,
                 root  : String,
                 doken : mutable(Doken.Type),
                 hash  : String,
               }));

export type Params = Schema.Type<typeof Params>;



export const MessageParser =
               TemplateLiteralParser(
                 'dsx/',
                 String,
                 '/',
                 String,
                 '/',
                 String,
                 '/',
                 String,
                 '/',
                 NumberFromString,
                 '/',
                 String,
                 '/',
                 String,
                 '/',
                 String,
               );

export const MessageRoute = transform(MessageParser, Params, {
  strict: true,
  encode: (a) => {
    return [
      'dsx/',
      a.root,
      '/',
      a.doken.ephemeral,
      '/',
      a.doken.type,
      '/',
      a.doken.id,
      '/',
      a.doken.ttl,
      '/',
      a.doken.status,
      '/',
      a.doken.token!,
      '/',
      a.hash,
    ] as const;
  },
  decode: (a) => {
    const [, aR, , aE, , aT, , aI, , aTTL, , aS, , aTo, , aH] = a;

    return {
      origin: 'Message',
      root  : aR,
      hash  : aH,
      doken : {
        _tag     : 'Doken' as const,
        ephemeral: aE,
        type     : aT,
        id       : aI,
        ttl      : aTTL,
        token    : aTo,
        status   : aS as never,
      },
    };
  },
});

export const encodeMessageRoute = encodeSync(MessageRoute);
export const decodeMessageRoute = decodeSync(MessageRoute);



export const DialogParser =
               TemplateLiteralParser(
                 'dsx/',
                 String,
                 '/',
                 String,
                 '/',
                 String,
                 '/',
                 String,
                 '/',
                 NumberFromString,
               );

export const DialogRoute = transform(DialogParser, Params, {
  strict: true,
  encode: (a) => {
    return [
      'dsx/',
      a.root,
      '/',
      a.doken.ephemeral,
      '/',
      a.doken.type,
      '/',
      a.doken.id,
      '/',
      a.doken.ttl,
    ] as const;
  },
  decode: (a) => {
    const [, aR, , aE, , aT, , aI, , aTTL] = a;

    return {
      origin: 'Dialog',
      root  : aR,
      hash  : '-',
      doken : {
        _tag     : 'Doken' as const,
        ephemeral: aE,
        type     : aT,
        id       : aI,
        ttl      : aTTL,
        status   : '2' as const,
      },
    };
  },
});

export const encodeDialogRoute = encodeSync(DialogRoute);
export const decodeDialogRoute = decodeSync(DialogRoute);
