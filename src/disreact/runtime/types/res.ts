import type {Defer, Rest} from '#src/disreact/api/index.ts';
import type {TTL} from '#src/disreact/runtime/types/index.ts';



export type Res = {
  id     : string;
  ttl    : TTL.TTL;
  message: Rest.Message | null;
  dialog : Rest.Dialog | null;
};
