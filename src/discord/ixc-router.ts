import {exampleDriver} from '#discord/example.ts';
import {implementation} from '#discord/flows/implementation.ts';
import {original} from '#src/discord/ixc-original.ts';
import type {IxD} from '#src/internal/discord.ts';
import {E, p} from '#src/internal/pure/effect.ts';


const drivers = [
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

  const driver = drivers.find((driver) => data.custom_id.includes(`/${driver.name}`));

  if (!driver) {
    return yield * original(ix);
  }

  return yield * implementation(driver, ix);
});


export const ixcRouter = (ix: IxD) => p(
  router(ix), // todo add "recoverable error"
);
