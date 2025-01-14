import {E, g, L} from '#pure/effect';
import type { Pipeline} from '#src/internal/disreact/entity/index.ts';
import {Err} from '#src/internal/disreact/entity/index.ts';
import type {num, rec, str} from '#src/internal/pure/types-pure.ts';
import type {EAR} from '#src/internal/types.ts';


const implementation = (
  config: {
    pipelines: Pipeline.PipelineArray;
  },
) => E.gen(function * () {
  const pipelines = {} as rec<typeof config.pipelines[num]>;

  for (const pipeline of config.pipelines) {
    pipelines[pipeline.pipe_id] = pipeline;
  }

  return {
    getPipeline: (pipe_id: str) => g(function * () {
      if (!(pipe_id in pipelines)) {
        return yield * new Err.PipelineNotFound();
      }
      return pipelines[pipe_id];
    }),
  };
});


export class PipelineManager extends E.Tag('PipelineManager')<
  PipelineManager,
  EAR<typeof implementation>
>() {
  static makeLayer = (pipelines: Pipeline.PipelineArray) => L.effect(this, implementation({pipelines}));
}
