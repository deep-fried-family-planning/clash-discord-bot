import {DisReactDOM} from '#src/disreact/runtime/DisReactDOM.ts'
import {makeDefaultRuntimeLayer, makeRuntimeWithLayer} from '#src/disreact/runtime/DisReactRuntime.ts'
import {E, L} from '#src/internal/pure/effect.ts'
import {it, vi} from '@effect/vitest'
import {pipe, Redacted, TestClock} from 'effect'
import {liveServices} from 'effect/TestServices'
import {TestDialog} from 'test/components/test-dialog.tsx'
import {TestMessage} from 'test/components/test-message.tsx'
import TestMessageJSON from 'test/unit/disreact/runtime/.synthesized/TestMessage.json'


const mockReply = vi.fn()

const runtimeLayer = pipe(
  makeDefaultRuntimeLayer({
    options: {
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
    ixDOM: L.succeed(DisReactDOM, DisReactDOM.make({
      defer   : vi.fn(),
      discard : vi.fn(),
      create  : vi.fn(),
      reply   : mockReply,
      dismount: vi.fn(),
    })),
  }),
  L.provide(
    TestClock.defaultTestClock.pipe(
      L.provide(L.effectContext(E.succeed(liveServices))),
    ),
  ),
)

const runtime = makeRuntimeWithLayer(runtimeLayer)

it.effect('when responding', E.fn(function* () {
  yield* TestClock.setTime(0)

  yield* runtime.respond({
    id            : 'respond1',
    token         : 'respond1',
    application_id: 'app',
    message       : TestMessageJSON,
    event         : {
      id  : 'actions:2:button:0',
      prop: 'onclick',
    },
  }).pipe(E.awaitAllChildren)

  yield* E.promise(() =>
    expect(JSON.stringify(mockReply.mock.calls[0][2], null, 2)).toMatchFileSnapshot('./.responded/TestMessage1.json'),
  )

  yield* runtime.respond({
    id            : 'respond2',
    token         : 'respond2',
    application_id: 'app',
    message       : mockReply.mock.calls[0][2],
    event         : {
      id  : 'actions:2:button:0',
      prop: 'onclick',
    },
  }).pipe(E.awaitAllChildren)

  yield* E.promise(() =>
    expect(JSON.stringify(mockReply.mock.calls[1][2], null, 2)).toMatchFileSnapshot('./.responded/TestMessage2.json'),
  )
}))
