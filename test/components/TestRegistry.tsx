import {Codec} from '#src/disreact/codec/Codec.ts'
import {DsxSettings} from '#src/disreact/runtime/DisReactConfig.ts'
import {DokenMemory} from '#src/disreact/runtime/DokenMemory.ts'
import {DisReactDOM} from '#src/disreact/runtime/DisReactDOM.ts'
import {HooksDispatcher} from '#src/disreact/model/HooksDispatcher.ts'
import {Relay} from '#src/disreact/model/Relay.ts'
import {SourceRegistry} from '#src/disreact/model/SourceRegistry.ts'
import {E, L, pipe} from '#src/internal/pure/effect.ts'
import type {Vitest} from '@effect/vitest'
import {expect, it as vfx, vi} from '@effect/vitest'
import {Redacted} from 'effect'
import {TestDialog} from 'test/components/test-dialog.tsx'
import {TestMessage} from 'test/components/test-message.tsx'

export const expectJSON = (filename: string) => (actual: any) =>
  E.promise(
    async () =>
      await expect(JSON.stringify(actual, null, 2)).toMatchFileSnapshot(filename),
  )

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
)


export const TestRegistry = pipe(
  L.mergeAll(
    // L.effectContext(E.succeed(liveServices)),
    pipe(
      SourceRegistry.Default,
      L.provide(config),
    ),
    Codec.Default,
    HooksDispatcher.Default,
    L.succeed(DisReactDOM, DisReactDOM.make({
      defer   : vi.fn().mockReturnValue(E.void),
      discard : vi.fn().mockReturnValue(E.void),
      create  : vi.fn().mockReturnValue(E.void),
      reply   : vi.fn().mockReturnValue(E.void),
      dismount: vi.fn().mockReturnValue(E.void),
    })).pipe(L.provide(config)),
    DokenMemory.Default.pipe(
      L.provide(config),
    ),
    Relay.Fresh,
  ),
)

let local: Vitest.Methods<L.Layer.Success<typeof TestRegistry>>

vfx.layer(TestRegistry)((it) => local = it as any)

// @ts-expect-error testing convenience
export const it = local

export const nofunc = (node: any) => {
  if ('props' in node && node.props && typeof node.props === 'object') {
    delete node.props['onclick']
    delete node.props['onselect']
  }

  if ('children' in node && node.children.length > 0) {
    node.children = node.children.map((child: any) => nofunc(child))
  }

  return node
}
