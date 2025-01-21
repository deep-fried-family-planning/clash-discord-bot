import {TestComponent} from '#disreact/virtual/entities/aope.tsx';
import {Starter} from '#src/discord/initializer.ts';
import {NodeManager} from '#src/internal/disreact/runtime-old/layers/node-manager.ts';


export const IxRouter = NodeManager.makeLayer({
  Starter,
});
TestComponent;
