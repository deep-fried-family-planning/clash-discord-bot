import {synthesize} from '#src/disreact/runtime/synthesize.ts'
import {E} from '#src/internal/pure/effect.ts'
import {TestMessage} from 'test/components/test-message.tsx'
import {it} from 'test/components/TestRegistry.tsx'


it.effect('when synthesizing', E.fn(function* () {
  const root = yield* synthesize(TestMessage)

  yield* E.promise(() =>
    expect(JSON.stringify(root, null, 2)).toMatchFileSnapshot('./.synthesized/TestMessage.json'),
  )
}))

it.effect('performance', E.fn(function* () {
  const runs = Array.from({length: 10000})

  for (let i = 0; i < runs.length; i++) {
    const root = yield* synthesize(TestMessage)

    yield* E.promise(() =>
      expect(JSON.stringify(root, null, 2)).toMatchFileSnapshot('./.synthesized/TestMessage.json'),
    )
  }
}))
