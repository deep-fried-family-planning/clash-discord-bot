import {E} from '#pure/effect';
import type {str} from '#src/internal/pure/types-pure.ts';


export const annotateLogPhase = (phase: str) => E.annotateLogs('phase', phase);
export const annotateLogPipeline = (pipeline: str) => E.annotateLogs('pipeline', pipeline);
export const annotateLogLifeCycle = (lifecycle: str) => E.annotateLogs('lifecycle', lifecycle);
export const annotateLogService = (service: str) => E.annotateLogs('service', service);


export const annotateSpanPhase = (phase: str) => E.annotateCurrentSpan('phase', phase);
export const annotateSpanPipeline = (pipeline: str) => E.annotateCurrentSpan('pipeline', pipeline);
export const annotateSpanLifeCycle = (lifecycle: str) => E.annotateCurrentSpan('lifecycle', lifecycle);
export const annotateSpanService = (service: str) => E.annotateCurrentSpan('service', service);


export const annotatePhase = (phase: str) => ({
  log : annotateLogPhase(phase),
  span: annotateSpanPhase(phase),
});


export const annotatePipeline = (pipeline: str) => ({
  log : annotateLogPipeline(pipeline),
  span: annotateSpanPipeline(pipeline),
});


export const annotateLifeCycle = (lifecycle: str) => ({
  log : annotateLogLifeCycle(lifecycle),
  span: annotateSpanLifeCycle(lifecycle),
});


export const annotateService = (service: str) => ({
  log : annotateLogService(service),
  span: annotateSpanService(service),
});
