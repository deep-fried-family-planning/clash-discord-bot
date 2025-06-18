import {useEffect, useState} from '#src/disreact/index.ts';
import {ModelV1} from '#src/disreact/model/ModelV1.ts';
import {Relay} from '#src/disreact/model/Relay.ts';
import {sjson} from '#unit/model/scenarios/util.ts';
import {it} from '@effect/vitest';
import * as E from 'effect/Effect';
import * as L from 'effect/Layer';
import * as Logger from 'effect/Logger';
import * as LogLevel from 'effect/LogLevel';

const root = vi.fn((p: any) => E.void);
const nest1 = vi.fn((p: any) => E.void);
const nest2 = vi.fn((p: any) => E.void);

class UseEffectService extends E.Service<UseEffectService>()('test', {
  succeed: {
    root : (p: any) => E.void,
    nest1: (p: any) => E.void,
    nest2: (p: any) => E.void,
  },
  accessors: true,
}) {}

const mockService = L.succeed(UseEffectService, UseEffectService.make({
  root,
  nest1,
  nest2,
}));

const Root = () => E.gen(function* () {
  const [num, setNum] = useState(0);

  useEffect(E.fn(function* () {
    yield* UseEffectService.root(num);
  }), [num]);

  return (
    <ephemeral>
      <embed>{`${num}`}</embed>
      <Nest1
        setNum={setNum}
        num={num}
      />
    </ephemeral>
  );
});

type Props = {
  num   : number;
  setNum: (num: number) => void;
};

const Nest1 = (props: Props) => E.gen(function* () {
  return (
    <actions>
      <primary
        label={'Nest1'}
        onclick={E.fn(function* () {
          yield* UseEffectService.nest1(props.num);
        })}
      />
      <Nest2
        num={props.num}
        setNum={props.setNum}
      />
    </actions>
  );
});

const Nest2 = (props: Props) => E.gen(function* () {
  useEffect(E.fn(function* () {
    yield* UseEffectService.nest2(props.num);
    props.setNum(props.num + 1);
  }), [props.num]);

  return (
    <primary
      label={'Nest2'}
      onclick={() => props.setNum(props.num + 1)}
    />
  );
});

const TestLayer = () => L.mergeAll(
  ModelV1.layer({
    sources: {
      Root,
    },
  }),
).pipe(
  L.provideMerge(mockService),
  // L.provideMerge(Logger.replace(Logger.defaultLogger, Logger.prettyLoggerDefault)),
  // L.provideMerge(Logger.minimumLogLevel(LogLevel.All)),
);

it.effect.skip('when rendered', E.fn(function* () {
  const actual = yield* ModelV1.createRoot(Root, {}, {});

  // expect(root).toBeCalledTimes(1);
  // expect(nest1).toBeCalledTimes(0);
  // expect(nest2).toBeCalledTimes(1);
  expect(sjson(actual?._tag)).toMatchInlineSnapshot(`""message""`);
  expect(sjson(actual?.data)).toMatchInlineSnapshot(`
    "{
      "embeds": [
        {
          "description": "0"
        }
      ],
      "components": [
        {
          "type": 1,
          "components": [
            {
              "type": 2,
              "style": 1,
              "custom_id": "actions:0:primary:0",
              "label": "Nest1"
            },
            {
              "type": 2,
              "style": 1,
              "custom_id": "Nest2:0:primary:0",
              "label": "Nest2"
            }
          ]
        }
      ],
      "flags": 64
    }"
  `);
  expect(sjson(actual?.hydrator)).toMatchInlineSnapshot(`
    "{
      "id": "Root",
      "props": {},
      "stacks": {
        "Root:0": [
          {
            "s": 1
          },
          {
            "d": [
              0
            ]
          }
        ],
        "Root:0:ephemeral:0:Nest1:0": [],
        "Root:0:ephemeral:0:Nest1:0:actions:0:Nest2:0": [
          {
            "d": [
              0
            ]
          }
        ]
      }
    }"
  `);
}, E.provide(TestLayer())));

it.effect.skip('when nest1 clicked', E.fn(function* () {
  const hydrator = {
    id    : 'Root',
    props : {},
    stacks: {
      'Root:0': [
        {
          s: 1,
        },
        {
          d: [
            0,
          ],
        },
      ],
      'Root:0:ephemeral:0:Nest1:0'                  : [],
      'Root:0:ephemeral:0:Nest1:0:actions:0:Nest2:0': [
        {
          d: [
            0,
          ],
        },
      ],
    },
  };
  const event = {
    id  : 'actions:0:primary:0',
    data: {},
  };
  const actual = yield* ModelV1.invokeRoot(hydrator, event, {});

  expect(root).toBeCalledTimes(1);
  expect(nest1).toBeCalledTimes(0);
  expect(nest2).toBeCalledTimes(1);
}, E.provide([TestLayer(), Relay.Fresh])));

it.effect('when nest2 clicked', E.fn(function* () {

}, E.provide([TestLayer(), Relay.Fresh])));

it.effect('when nest1 and then nest2 clicked', E.fn(function* () {

}, E.provide([TestLayer(), Relay.Fresh])));
