import {Model} from '#src/disreact/model/Model.ts';
import {Relay} from '#src/disreact/model/Relay.ts';
import {TestMessage} from '#unit/components/test-message.tsx';
import {sjson} from '#unit/model/scenarios/util.ts';
import {it} from '@effect/vitest';
import * as LogLevel from 'effect/LogLevel';
import * as E from 'effect/Effect';
import * as L from 'effect/Layer';
import * as Logger from 'effect/Logger';

const TestLayer = () => L.mergeAll(
  Model.layer({
    sources: {
      TestMessage,
    },
  }),
).pipe(

  // L.provideMerge(Logger.replace(Logger.defaultLogger, Logger.prettyLoggerDefault)),
  // L.provideMerge(Logger.minimumLogLevel(LogLevel.All)),
);

it.effect('when rendered', E.fn(function* () {
  const actual = yield* Model.createRoot(TestMessage, {}, {});

  expect(sjson(actual?._tag)).toMatchInlineSnapshot(`""message""`);
  expect(sjson(actual?.data)).toMatchInlineSnapshot(`
    "{
      "embeds": [
        {
          "title": "Omni Board",
          "description": "V2 - JSX Pragma"
        },
        {
          "title": "Test Title - NOT markdown",
          "description": "### H3-# \\n<@123456>\\n__$ not a link__"
        }
      ],
      "components": [
        {
          "type": 1,
          "components": [
            {
              "type": 2,
              "style": 1,
              "custom_id": "actions:0:button:0",
              "label": "Start 0"
            },
            {
              "type": 2,
              "style": 2,
              "custom_id": "actions:0:secondary:0",
              "label": "Help"
            }
          ]
        },
        {
          "type": 1,
          "components": [
            {
              "type": 3,
              "custom_id": "message:0:select:0",
              "options": [
                {
                  "value": "1",
                  "label": "1"
                },
                {
                  "value": "2",
                  "label": "2"
                },
                {
                  "value": "3",
                  "label": "3",
                  "default": true
                }
              ]
            }
          ]
        }
      ],
      "flags": 64
    }"
  `);
  expect(sjson(actual?.hydrator)).toMatchInlineSnapshot(`
    "{
      "id": "TestMessage",
      "props": {},
      "stacks": {
        "TestMessage:0": [
          {
            "s": 0
          }
        ],
        "TestMessage:0:message:0:Header:0": []
      }
    }"
  `);
}, E.provide(TestLayer())));

it.effect('when clicked', E.fn(function* () {
  const hydrator = {
    id    : 'TestMessage',
    props : {},
    stacks: {
      'TestMessage:0': [
        {
          s: 0,
        },
      ],
      'TestMessage:0:message:0:Header:0': [],
    },
  };
  const event = {
    id  : 'actions:0:button:0',
    data: {},
  };
  const actual = yield* Model.invokeRoot(hydrator, event, {});
  expect(sjson(actual?._tag)).toMatchInlineSnapshot(`""message""`);
  expect(sjson(actual?.data)).toMatchInlineSnapshot(`
    "{
      "embeds": [
        {
          "title": "Omni Board",
          "description": "V2 - JSX Pragma"
        },
        {
          "title": "Test Title - NOT markdown",
          "description": "### H3-# \\n<@123456>\\n__$ not a link__"
        }
      ],
      "components": [
        {
          "type": 1,
          "components": [
            {
              "type": 2,
              "style": 1,
              "custom_id": "actions:0:button:0",
              "label": "Start 1"
            },
            {
              "type": 2,
              "style": 2,
              "custom_id": "actions:0:secondary:0",
              "label": "Help"
            }
          ]
        },
        {
          "type": 1,
          "components": [
            {
              "type": 3,
              "custom_id": "message:0:select:0",
              "options": [
                {
                  "value": "1",
                  "label": "1"
                },
                {
                  "value": "2",
                  "label": "2"
                },
                {
                  "value": "3",
                  "label": "3",
                  "default": true
                }
              ]
            }
          ]
        }
      ],
      "flags": 64
    }"
  `);
  expect(sjson(actual?.hydrator)).toMatchInlineSnapshot(`
    "{
      "id": "TestMessage",
      "props": {},
      "stacks": {
        "TestMessage:0": [
          {
            "s": 1
          }
        ],
        "TestMessage:0:message:0:Header:0": []
      }
    }"
  `);
}, E.provide([TestLayer(), Relay.Fresh])));
