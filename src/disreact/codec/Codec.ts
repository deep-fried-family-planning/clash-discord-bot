import type {Rest} from '#src/disreact/codec/abstract/index.ts';
import {E} from '#src/internal/pure/effect.ts';



export type CodecMenuRoute = {
  version  : string;
  root     : string;
  portal?  : string;
  id       : string;
  value    : string;
  ttl      : number;
  type     : number;
  ephemeral: number;
};

export type CodecCommandRoute = {

};



export class Codec extends E.Tag('DisReact.Codec')<
  Codec,
  {
    decodeCommand: (rest: Rest.Ix) => CodecCommandRoute;
    decodeMessage: (rest: Rest.Message) => CodecMenuRoute;
    decodeDialog : (rest: Rest.Ix) => CodecMenuRoute;
  }
>() {

}
