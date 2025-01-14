import {directSimulation} from '#src/internal/disreact/lifecycle/simulation/direct-simulation.ts';
import {simulateClick} from '#src/internal/disreact/lifecycle/simulation/simulate-click.ts';
import {simulateCommand} from '#src/internal/disreact/lifecycle/simulation/simulate-command.ts';
import {simulateSubmit} from '#src/internal/disreact/lifecycle/simulation/simulate-submit.ts';


export const pipelines = {
  a: directSimulation,
  b: simulateClick,
  c: simulateCommand,
  d: simulateSubmit,
};
