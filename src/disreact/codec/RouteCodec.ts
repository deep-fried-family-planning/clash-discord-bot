import {encodeMessageDsx} from '#src/disreact/codec/dsx/element-encode.ts';
import console from 'node:console';
import {FiberHash, type RootElement} from './fiber';
import {Dokens, EmbedParams} from './rest';



export const decodeRequest = (request: any) => {

};

export const encodeMessage = (
  root: RootElement.T,
  dokens: Dokens.T,
) => {
  const doken = Dokens.getDoken(dokens);
  console.log(root.element);
  const message = encodeMessageDsx(root.element);
  const hash    = FiberHash.hash(root.fiber);

  return EmbedParams.encodeMessageRouteToURL(
    {
      root_id: root.root_id,
      doken,
      hash,
    },
    message,
  );
};

export const decodeMessage = () => {};

export const encodeDialog = () => {};

export const decodeDialog = () => {};
