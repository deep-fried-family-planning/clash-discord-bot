import {directSimulation} from '#src/internal/disreact/runtime/pipelines/direct-simulation.ts';
import {simulateClick} from '#src/internal/disreact/runtime/pipelines/simulate-click.ts';
import {simulateCommand} from '#src/internal/disreact/runtime/pipelines/simulate-command.ts';
import {simulateSubmit} from '#src/internal/disreact/runtime/pipelines/simulate-submit.ts';


export const pipelines = {
  a: directSimulation,
  b: simulateClick,
  c: simulateCommand,
  d: simulateSubmit,
};
