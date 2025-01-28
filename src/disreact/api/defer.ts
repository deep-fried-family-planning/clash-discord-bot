import {Rest} from '#src/disreact/api/index.ts';
import {D, pipe} from '#src/internal/pure/effect.ts';
import type {bool} from '#src/internal/pure/types-pure.ts';



export type Defer = D.TaggedEnum<{
  None         : {done?: bool};
  Close        : {done?: bool};
  Public       : {done?: bool; rest: typeof Rest.Public};
  PublicUpdate : {done?: bool; rest: typeof Rest.PublicUpdate};
  Private      : {done?: bool; rest: typeof Rest.Private};
  PrivateUpdate: {done?: bool; rest: typeof Rest.PrivateUpdate};
  OpenDialog   : {done?: bool; rest: typeof Rest.OpenDialog};
}>;

export type None = D.TaggedEnum.Value<Defer, 'None'>;
export type Close = D.TaggedEnum.Value<Defer, 'Close'>;
export type Public = D.TaggedEnum.Value<Defer, 'Public'>;
export type PublicUpdate = D.TaggedEnum.Value<Defer, 'PublicUpdate'>;
export type Private = D.TaggedEnum.Value<Defer, 'Private'>;
export type PrivateUpdate = D.TaggedEnum.Value<Defer, 'PrivateUpdate'>;
export type OpenDialog = D.TaggedEnum.Value<Defer, 'OpenDialog'>;

export const Defer           = D.taggedEnum<Defer>();
export const None            = () => Defer.None({}) as Defer;
export const Close           = () => Defer.Close({});
export const Public          = () => Defer.Public({rest: Rest.Public});
export const PublicUpdate    = () => Defer.PublicUpdate({rest: Rest.PublicUpdate});
export const Private         = () => Defer.Private({rest: Rest.Private});
export const PrivateUpdate   = () => Defer.PrivateUpdate({rest: Rest.PrivateUpdate});
export const OpenDialog      = () => Defer.OpenDialog({rest: Rest.OpenDialog});
export const isNone          = Defer.$is('None');
export const isClose         = Defer.$is('Close');
export const isPublic        = Defer.$is('Public');
export const isPublicUpdate  = Defer.$is('PublicUpdate');
export const isPrivate       = Defer.$is('Private');
export const isPrivateUpdate = Defer.$is('PrivateUpdate');
export const isOpenDialog    = Defer.$is('OpenDialog');

export const getEphemeral = Defer.$match({
  None         : () => false,
  Close        : () => false,
  Public       : () => false,
  PublicUpdate : () => false,
  Private      : () => true,
  PrivateUpdate: () => true,
  OpenDialog   : () => false,
});

export const setDone = (df: Defer) => {
  return Defer[df._tag]({
    ...df,
    done: true,
  } as never);
};

const decodings = {
  B: Close,
  C: Public,
  D: PublicUpdate,
  E: Private,
  F: PrivateUpdate,
  G: OpenDialog,
};

export const decodeDefer = (tx: string) => {
  if (tx in decodings) {
    return pipe(
      decodings[tx as keyof typeof decodings](),
      setDone,
    );
  }
  return pipe(
    None(),
    setDone,
  );
};

export const encodeDefer = Defer.$match({
  None         : () => 'A',
  Close        : () => 'B',
  Public       : () => 'C',
  PublicUpdate : () => 'D',
  Private      : () => 'E',
  PrivateUpdate: () => 'F',
  OpenDialog   : () => 'G',
});
