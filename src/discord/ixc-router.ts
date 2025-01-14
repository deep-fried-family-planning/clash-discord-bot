import {exampleDriver} from '#src/discord/example.ts';
import {original} from '#src/discord/ixc-original.ts';
import {v2driver} from '#src/discord/omni-board/omni-board-driver.ts';
import type {IxD} from '#src/internal/discord.ts';
import {IxService} from '#src/internal/disreact/context/ix-service.ts';
import {execute} from '#src/internal/disreact/context/lifecycle/execute.ts';
import {EmbedControllerPath} from '#src/internal/disreact/entity/routing/embed-controller-path.ts';
import {E, p} from '#src/internal/pure/effect.ts';
import type {Ix} from 'src/internal/disreact/entity';


const drivers = [
  v2driver,
  exampleDriver,
];


const router = (ix: IxD) => E.gen(function * () {
  const data = ix.data;

  if (!data) {
    return;
  }
  if (!('custom_id' in data)) {
    return;
  }
  if (!('message' in ix)) {
    return;
  }

  const url = new URL(ix.message.embeds[0].image.url);
  const controllerpath = EmbedControllerPath.parse(url);

  const driver = drivers.find((driver) => controllerpath.root === driver.name);

  if (!driver) {
    return yield * original(ix);
  }

  yield * execute(ix as Ix.Rest, driver);
  return yield * IxService.reset();
});

// todo add "recoverable error"
export const ixcRouter = (ix: IxD) => p(
  router(ix),
);
