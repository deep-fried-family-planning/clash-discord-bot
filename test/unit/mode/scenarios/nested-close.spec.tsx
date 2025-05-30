import {usePage} from '#src/disreact/index.ts';
import * as El from '#src/disreact/mode/entity/el.ts';
import * as Model from '#src/disreact/mode/model.ts';
import {RehydrantDOM} from '#src/disreact/mode/RehydrantDOM.ts';
import {Rehydrator} from '#src/disreact/mode/Rehydrator.ts';
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
  RehydrantDOM.Fresh,
);

it.effect('when rendered', E.fn(function* () {
  const actual = yield* Model.createRoot(NestedClose).pipe(E.provide(TestLayer()));
  expect(actual?._tag).toMatchInlineSnapshot(`"message"`);
  expect(actual?.data).toMatchInlineSnapshot(`
    {
      "components": [
        {
          "components": [
            {
              "custom_id": "NestedIncrementButton",
              "disabled": undefined,
              "emoji": undefined,
              "label": "NestedIncrementButton",
              "style": 1,
              "type": 2,
            },
            {
              "custom_id": "NestedCloseButton",
              "disabled": undefined,
              "emoji": undefined,
              "label": "NestedCloseButton",
              "style": 1,
              "type": 2,
            },
          ],
          "type": 1,
        },
      ],
      "content": undefined,
      "embeds": [
        {
          "author": undefined,
          "color": undefined,
          "description": undefined,
          "fields": undefined,
          "footer": undefined,
          "image": undefined,
          "title": "NestedClose",
          "url": undefined,
        },
      ],
      "flags": undefined,
    }
  `);
  expect(actual?.hydrator).toMatchInlineSnapshot(`
    {
      "id": "NestedClose",
      "props": {},
      "stacks": {
        "NestedClose:0": [],
        "NestedClose:0:message:0:NestedActions:0": [],
        "NestedClose:0:message:0:NestedActions:0:actions:0:NestedCloseButton:0": [
          null,
        ],
      },
    }
  `);
}));

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
  const actual = yield* Model.invokeRoot(hydrator, El.event('NestedCloseButton', {}), {});
  expect(actual).toEqual(null);
}, E.provide(TestLayer())));
