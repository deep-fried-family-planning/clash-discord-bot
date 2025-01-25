import type {DA} from '#disreact/virtual/entities/index.ts';
import type {ne, str, unk} from '#src/internal/pure/types-pure.ts';



export const dsx    = 'embed';
export const tagged = (tag: str) => tag === dsx;
export const typed  = (x: unk): x is Model => !!x && typeof x === 'object' && '_tag' in x && x._tag === dsx;


export type Attributes = DA.Embed;

export type Rest = DA.Embed;

export type Model = {
  _tag : typeof dsx;
  props: Attributes;
};


export const createEmbedElement = (
  tag: ne,
  props: ne,
) => {
  return {
    _tag: dsx,
    props,
  };
};
