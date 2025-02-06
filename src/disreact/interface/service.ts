import type {DEvent, Doken, Rest} from '#src/disreact/abstract/index.ts';
import {makeDiscordDOMDFX} from '#src/disreact/implementation/DiscordDOM-dfx.ts';
import {makeDisReactCodecDefault} from '#src/disreact/implementation/DisReactCodec-default.ts';
import {makeDokenMemoryDynamo} from '#src/disreact/implementation/DokenMemory-dynamo.ts';
import {makeLocalDokenMemory} from '#src/disreact/implementation/DokenMemory-local.ts';
import type {DisReactCodecError, DokenMemoryError} from '#src/disreact/interface/error.ts';
import {E} from '#src/internal/pure/effect.ts';
import type {Cause} from 'effect';



export class DiscordDOM extends E.Tag('DisReact.DiscordDOM')<
  DiscordDOM,
  {
    acknowledge: (d: Doken.T) => any;
    defer      : (d: Doken.T) => any;
    create     : (d: Doken.T) => any;
    reply      : (d: Doken.T) => any;
    update     : (d: Doken.T) => any;
    dismount   : (d: Doken.T) => any;
  }
>() {
  static defaultLayer = makeDiscordDOMDFX;
}



export class DisReactCodec extends E.Tag('DisReact.Codec')<
  DisReactCodec,
  {
    decodeEvent  : (rest: Rest.Ix) => E.Effect<DEvent.T, DisReactCodecError>;
    decodeMessage: (rest: Rest.Ix) => E.Effect<void, DisReactCodecError>;
    encodeMessage: (rest: Rest.Ix) => E.Effect<void, DisReactCodecError>;
    decodeDialog : (rest: Rest.Ix) => E.Effect<void, DisReactCodecError>;
    encodeDialog : (rest: Rest.Ix) => E.Effect<void, DisReactCodecError>;
  }
>() {
  static defaultLayer = makeDisReactCodecDefault;
}



type DokenMemoryKind =
  | 'local'
  | 'dynamo'
  | 'custom';

type DokenError =
  | DokenMemoryError
  | Cause.UnknownException;

export class DokenMemory extends E.Tag('DisReact.DokenMemory')<
  DokenMemory,
  {
    kind   : DokenMemoryKind;
    load   : (id: string) => E.Effect<Doken.T | null, DokenError>;
    memLoad: (id: string) => E.Effect<Doken.T | null, DokenError>;
    free   : (id: string) => E.Effect<void, DokenError>;
    memFree: (id: string) => E.Effect<void, DokenError>;
    save   : (d: Doken.T) => E.Effect<void, DokenError>;
    memSave: (d: Doken.T) => E.Effect<void, DokenError>;
  }
>() {
  static localLayer  = makeLocalDokenMemory;
  static dynamoLayer = makeDokenMemoryDynamo;
}
