import type {str} from '#src/internal/pure/types-pure.ts';
import type {AnyE} from '#src/internal/types.ts';


export type T<
  A extends AnyE<void>,
> = {
  pipe_id: str;
  run    : () => A;
};


export const make = <
  A extends AnyE<void>,
>(
  config: {
    pipe_id: str;
    run    : () => A;
  },
): T<A> => config;


export type PipelineArray = ReturnType<typeof make>[];
