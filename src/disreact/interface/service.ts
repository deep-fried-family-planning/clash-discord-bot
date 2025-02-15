import type {Doken} from '#src/disreact/codec/abstract/index.ts';
import {makeDfx} from '#src/disreact/interface/implementation/DiscordDOM-dfx.ts';
import {makeDokenMemoryDynamo} from '#src/disreact/interface/implementation/DokenMemory-dynamo.ts';
import {makeLocalDokenMemory} from '#src/disreact/interface/implementation/DokenMemory-local.ts';
import type {DokenMemoryError} from '#src/disreact/interface/error.ts';
import {E, L} from '#src/internal/pure/effect.ts';
import type {DiscordRESTError} from 'dfx/DiscordREST';
import type {Cause} from 'effect';



export class DiscordDOM extends E.Tag('DisReact.DiscordDOM')<
  DiscordDOM,
  {
    acknowledge: (d: Doken.T) => E.Effect<void, DiscordRESTError>;
    defer      : (d: Doken.T) => E.Effect<void, DiscordRESTError>;
    create     : (d: Doken.T, encoded: any) => E.Effect<void, DiscordRESTError>;
    reply      : (d: Doken.T, encoded: any) => E.Effect<void, DiscordRESTError>;
    update     : (d: Doken.T, encoded: any) => E.Effect<void, DiscordRESTError>;
    dismount   : (d: Doken.T) => E.Effect<void, DiscordRESTError>;
  }
>() {
  static defaultLayer = L.effect(this, makeDfx);
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
  static localLayer = makeLocalDokenMemory;
  static dynamoLayer = makeDokenMemoryDynamo;
}
