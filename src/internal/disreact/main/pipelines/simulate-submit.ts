import {g} from '#pure/effect';
import {Pipeline} from '#src/internal/disreact/entity/index.ts';


const simulateSubmit = g(function * () {
});


export const SubmitSimulation = Pipeline.make({
  pipe_id: 's',
  run    : () => simulateSubmit,
});
