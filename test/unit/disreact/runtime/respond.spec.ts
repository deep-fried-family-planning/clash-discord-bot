import {IxDOM} from '#src/disreact/runtime/IxDOM.ts'
import {respond } from '#src/disreact/runtime/respond.ts'
import {E} from '#src/internal/pure/effect.ts'
import {it} from '@effect/vitest'
import {DateTime, Redacted, TestClock} from 'effect'
import {TestRegistry} from 'test/components/TestRegistry.tsx'
import TestMessageJSON from './.synthesized/TestMessage.json'

it.effect('when responding', E.fn(function* () {
  yield* TestClock.setTime(0)

  yield* respond({
    id   : 'respond1',
    token: 'respond1',
    fresh: {
      _tag: 'Fresh',
      id  : 'fresh',
      val : Redacted.make('secret'),
      ttl : DateTime.unsafeMake(0),
      type: 0,
      flag: 0,
    },
    message: TestMessageJSON,
    event  : {
      id  : 'actions:2:button:0',
      prop: 'onclick',
    },
  })

  const ixdom = yield* IxDOM
  const root = ixdom.reply.mock.calls[0][2]

  yield* respond({
    id   : 'respond2',
    token: 'respond2',
    fresh: {
      _tag: 'Fresh',
      id  : 'fresh',
      val : Redacted.make('secret'),
      ttl : DateTime.unsafeMake(0),
      type: 0,
      flag: 0,
    },
    message: root,
    event  : {
      id  : 'actions:2:button:0',
      prop: 'onclick',
    },
  })

  // expect(true).toEqual(true)
  expect(JSON.stringify(ixdom.reply.mock.calls[1][2], null, 2)).toMatchFileSnapshot('./.responded/TestMessageAgain.json')
}, E.provide(TestRegistry)))
