import {DsxSettings} from '#src/disreact/external/DisReactConfig.ts';
import {SourceRegistry} from '#src/disreact/model/service/SourceRegistry.ts';
import {E, L, pipe} from '#src/internal/pure/effect.ts';
import type { Vitest } from '@effect/vitest';
import {it as vfx} from '@effect/vitest';
import {Redacted} from 'effect';
import {liveLayer, liveServices} from 'effect/TestServices';
import {TestDialog} from 'test/unit/disreact/components/test-dialog.tsx';
import {TestMessage} from 'test/unit/disreact/components/test-message.tsx';
import jsonStringify from 'safe-json-stringify';

export const expectJSON = (filename: string) => (actual: any) =>
  E.promise(
    async () =>
      await expect(jsonStringify(actual, null, 2)).toMatchFileSnapshot(filename),
  );


const config = DsxSettings.configLayer(
  {
    token  : Redacted.make(''),
    doken  : {capacity: 100},
    sources: {
      modal: [
        <TestDialog/>,
      ],
      ephemeral: [
        <TestMessage/>,
      ],
    },
  },
);


export const TestRegistry = pipe(
  SourceRegistry.Default,
  L.provide(config),
  L.provide(L.effectContext(E.succeed(liveServices))),
);

let local: Vitest.Methods<typeof SourceRegistry.Service>;

vfx.layer(TestRegistry)((it) => local = it as any);

// @ts-expect-error testing convenience
export const it = local;

export const nofunc = (node) => {
  if ('props' in node && node.props && typeof node.props === 'object') {
    delete node.props['onclick'];
    delete node.props['onselect'];
  }

  if ('children' in node && node.children.length > 0) {
    node.children = node.children.map((child) => nofunc(child));
  }

  return node;
};
