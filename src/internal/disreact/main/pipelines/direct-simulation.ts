import {g} from '#pure/effect';
import {Pipeline} from '#src/internal/disreact/entity/index.ts';


const directSimulation = g(function * () {

});


export const DirectSimulation = Pipeline.make({
  pipe_id: 'd',
  run    : () => directSimulation,
});
