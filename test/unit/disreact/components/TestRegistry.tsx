import {DsxSettings} from '#src/disreact/interface/DisReactConfig.ts';
import {SourceRegistry} from '#src/disreact/model/SourceRegistry.ts';
import {L, pipe} from '#src/internal/pure/effect.ts';
import {it as vfx} from '@effect/vitest';
import {Redacted} from 'effect';
import {TestDialog} from 'test/unit/disreact/model/components/test-dialog.tsx';
import {TestMessage} from 'test/unit/disreact/model/components/test-message.tsx';



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
);

let local;

vfx.layer(TestRegistry)((it) => local = it);

export const it = local;
