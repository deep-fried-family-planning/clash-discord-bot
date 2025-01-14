import {Starter} from '#src/internal/disreact/initializer.ts';
import {NodeManager} from '#src/internal/disreact/runtime/layers/node-manager.ts';


export const IxRouter = NodeManager.makeLayer({
  Starter,
});
