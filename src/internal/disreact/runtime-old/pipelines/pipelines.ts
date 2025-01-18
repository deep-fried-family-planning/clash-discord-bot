import {directSimulation} from '#src/internal/disreact/runtime-old/pipelines/direct-simulation.ts';
import {simulateClick} from '#src/internal/disreact/runtime-old/pipelines/simulate-click.ts';
import {simulateCommand} from '#src/internal/disreact/runtime-old/pipelines/simulate-command.ts';
import {simulateSubmit} from '#src/internal/disreact/runtime-old/pipelines/simulate-submit.ts';


export const pipelines = {
  a: directSimulation,
  b: simulateClick,
  c: simulateCommand,
  d: simulateSubmit,
};
