import type {D} from '#pure/effect';
import type {obj, str} from '#src/internal/pure/types-pure.ts';


export type Rx = D.TaggedEnum<{
  None: obj;

  Ping        : obj;
  Command     : {data: {}};
  Component   : {data: {}};
  Modal       : {data: {}};
  AutoComplete: {data: {}};

  Synthetic: {data: {channel: str}};
}>;
