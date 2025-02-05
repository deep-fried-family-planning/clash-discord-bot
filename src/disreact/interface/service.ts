import type {DEvent, Doken, Rest} from '#src/disreact/abstract/index.ts';
import type {Ix} from '#src/disreact/abstract/rest.ts';
import {makeDynamoDokenMemory} from '#src/disreact/implementation/DokenMemory-dynamo.ts';
import {makeLocalDokenMemory} from '#src/disreact/implementation/DokenMemory-local.ts';
import type {DokenMemoryError} from '#src/disreact/interface/error.ts';
import {E} from '#src/internal/pure/effect.ts';



type IDisReactCodec = {
  decodeEvent  : (rest: Rest.Ix) => DEvent.T;
  decodeMessage: (rest: Rest.Ix) => {};
  encodeMessage: (rest: Rest.Ix) => {};
  decodeDialog : (rest: Rest.Ix) => {};
  encodeDialog : (rest: Rest.Ix) => {};
};

export class DisReactCodec extends E.Tag('DisReact.Codec')<
  DisReactCodec,
  IDisReactCodec
>() {}



type DokenMemoryKind =
  | 'local'
  | 'dynamo'
  | 'custom';

type IDokenMemory = {
  kind   : DokenMemoryKind;
  load   : (id: string) => E.Effect<Doken.T | null, DokenMemoryError>;
  save   : (doken: Doken.T) => E.Effect<void, DokenMemoryError>;
  free   : (id: string) => E.Effect<void, DokenMemoryError>;
  memLoad: (id: string) => E.Effect<Doken.T | null, DokenMemoryError>;
  memSave: (doken: Doken.T) => E.Effect<void, DokenMemoryError>;
  memFree: (id: string) => E.Effect<void, DokenMemoryError>;
};

export class DokenMemory extends E.Tag('DisReact.DokenMemory')<
  DokenMemory,
  IDokenMemory
>() {
  static localLayer  = makeLocalDokenMemory;
  static dynamoLayer = makeDynamoDokenMemory;
}
