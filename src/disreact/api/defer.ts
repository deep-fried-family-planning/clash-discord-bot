import {Rest} from '#src/disreact/api/index.ts';
import {D } from '#src/internal/pure/effect.ts';

export type Defer = D.TaggedEnum<{
  None         : {};
  Close        : {};
  Public       : typeof Rest.Public;
  PublicUpdate : typeof Rest.PublicUpdate;
  Private      : typeof Rest.Private;
  PrivateUpdate: typeof Rest.PrivateUpdate;
  OpenDialog   : typeof Rest.OpenDialog;
}>;

export type None = D.TaggedEnum.Value<Defer, 'None'>;
export type Close = D.TaggedEnum.Value<Defer, 'Close'>;
export type Public = D.TaggedEnum.Value<Defer, 'Public'>;
export type PublicUpdate = D.TaggedEnum.Value<Defer, 'PublicUpdate'>;
export type Private = D.TaggedEnum.Value<Defer, 'Private'>;
export type PrivateUpdate = D.TaggedEnum.Value<Defer, 'PrivateUpdate'>;
export type OpenDialog = D.TaggedEnum.Value<Defer, 'OpenDialog'>;

export const Defer           = D.taggedEnum<Defer>();
export const None            = () => Defer.None() as Defer;
export const Close           = () => Defer.Close();
export const Public          = () => Defer.Public(Rest.Public);
export const PublicUpdate    = () => Defer.PublicUpdate(Rest.PublicUpdate);
export const Private         = () => Defer.Private(Rest.Private);
export const PrivateUpdate   = () => Defer.PrivateUpdate(Rest.PrivateUpdate);
export const OpenDialog      = () => Defer.OpenDialog(Rest.OpenDialog);
export const isNone          = Defer.$is('None');
export const isClose         = Defer.$is('Close');
export const isPublic        = Defer.$is('Public');
export const isPublicUpdate  = Defer.$is('PublicUpdate');
export const isPrivate       = Defer.$is('Private');
export const isPrivateUpdate = Defer.$is('PrivateUpdate');
export const isOpenDialog    = Defer.$is('OpenDialog');

export const isEphemeral = Defer.$match({
  None         : () => false,
  Close        : () => false,
  Public       : () => false,
  PublicUpdate : () => false,
  Private      : () => true,
  PrivateUpdate: () => true,
  OpenDialog   : () => false,
});

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
    return decodings[tx as keyof typeof decodings]();
  }
  return None();
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
