import {usePage} from '#src/disreact/index.ts';
import * as Model from '#src/disreact/model/adaptor/exp/ModelV1.ts';
import {Relay} from '#src/disreact/model/adaptor/exp/Relay.ts';
import {Rehydrator} from '#src/disreact/model/adaptor/exp/Rehydrator.ts';
import {sjson} from '#unit/model/scenarios/util.ts';
import {it} from '@effect/vitest';
import * as E from 'effect/Effect';
import * as L from 'effect/Layer';

const NestedCloseButton = () => {
  const page = usePage();

  return (
    <>
      <primary
        custom_id={'NestedCloseButton'}
        label={'NestedCloseButton'}
        onclick={() => page.close()}
      />
      <primary
        custom_id={'NestedIncrementButton'}
        label={'NestedIncrementButton'}
        onclick={() => page.close()}
      />
    </>
  );
};

const NestedActions = () => {
  return (
    <actions>
      <NestedCloseButton/>
    </actions>
  );
};

const NestedClose = () => {
  return (
    <message>
      <embed title={'NestedClose'}/>
      <NestedActions/>
    </message>
  );
};

const TestLayer = () => L.mergeAll(
  Rehydrator.Default({
    sources: {
      NestedClose,
    },
  }),
);

it.effect('when rendered', E.fn(function* () {
  const actual = yield* Model.createRoot(NestedClose, {}, {});

  expect(sjson(actual?._tag)).toMatchInlineSnapshot(`""message""`);
  expect(sjson(actual?.data)).toMatchInlineSnapshot(`
    "{
      "embeds": [
        {
          "title": "NestedClose"
        }
      ],
      "components": [
        {
          "type": 1,
          "components": [
            {
              "type": 2,
              "style": 1,
              "custom_id": "NestedCloseButton",
              "label": "NestedCloseButton"
            },
            {
              "type": 2,
              "style": 1,
              "custom_id": "NestedIncrementButton",
              "label": "NestedIncrementButton"
            }
          ]
        }
      ]
    }"
  `);
  expect(sjson(actual?.hydrator)).toMatchInlineSnapshot(`
    "{
      "id": "NestedClose",
      "props": {},
      "stacks": {
        "NestedClose:0": [],
        "NestedClose:0:message:0:NestedActions:0": [],
        "NestedClose:0:message:0:NestedActions:0:actions:0:NestedCloseButton:0": []
      }
    }"
  `);
}, E.provide(TestLayer())));

it.effect('when clicked', E.fn(function* () {
  const hydrator = {
    id    : 'NestedClose',
    props : {},
    stacks: {
      'NestedClose:0'                                                        : [],
      'NestedClose:0:message:0:NestedActions:0'                              : [],
      'NestedClose:0:message:0:NestedActions:0:actions:0:NestedCloseButton:0': [
        null,
      ],
    },
  };
  const event = {
    id  : 'NestedCloseButton',
    data: {},
  };
  const actual = yield* Model.invokeRoot(hydrator, event, {});
  expect(actual).toEqual(null);
}, E.provide([TestLayer(), Relay.Fresh])));
