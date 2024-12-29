import {AccessorEmbed, BasicEmbed, EmbedController} from '#discord/entities/exv.ts';
import {CxPath} from '#discord/entities/routing/cx-path.ts';
import {Button, Row, Select, Text, User} from '#discord/entities/vc.ts';
import {makeView} from '#discord/entities/view.ts';
import {useRestEmbedRef} from '#discord/simulation/hooks/use--rest-embed-ref.ts';
import {useDialogRef} from '#discord/simulation/hooks/use-dialog-ref.ts';
import {useEffect} from '#discord/simulation/hooks/use-effect.ts';
import {useRestRef} from '#discord/simulation/hooks/use-rest-ref.ts';
import {useState} from '#discord/simulation/hooks/use-state.ts';
import {useDialogView, useMessageView} from '#discord/simulation/hooks/use-view.ts';
import {StyleT} from '#pure/dfx';
import {CSL, g} from '#pure/effect';
import type {str} from '#src/internal/pure/types-pure.ts';
import console from 'node:console';
import {Driver} from '.';


const useEmbedEditorDescription = useDialogRef(
  'embed.description',
  (embed) => {
    return {data: {value: embed.description!}};
  },
  (text) => {
    return {description: text.data.value!};
  },
);


export const EmbedEditor = (props: {title: str}) => {
  const descriptionId = useEmbedEditorDescription();


  return AccessorEmbed({
    title    : props.title,
    accessors: [
      descriptionId,
    ],
  });
};


const ExampleDialog = () => {
  const descriptionId = useEmbedEditorDescription();
  const openView      = useMessageView();

  return [
    {
      title   : 'ExampleDialog',
      route   : CxPath.empty(),
      onSubmit: () => {
        openView(exampleView.name);
      },
    },
    Row(
      Text({
        accessor: descriptionId,
        label   : 'ope',
        style   : StyleT.PARAGRAPH,
      }),
    ),
  ] as const;
};


const Example = () => {
  const [clickCount, setClickCount]         = useState('click', 0);
  const [isResetDisabled, setResetDisabled] = useState('reset', true);
  const openView                            = useMessageView();
  const openDialog                          = useDialogView();
  const [clickedEmbedRef, setClickedEmbed]  = useRestEmbedRef('clicked');

  const selectRef = useRestRef('users');
  const pickMeRef = useRestRef('pick_me');

  const externalData = [''];

  useEffect('testeffect', g(function * () {
    externalData[0] = 'effectful';
    yield * CSL.log('effect', externalData);
  }));

  console.log(externalData);

  return [
    EmbedController({
      description: clickCount === 2 ? 'click reset' : 'init',
    }),
    EmbedEditor({
      title: 'editor',
    }),
    BasicEmbed({
      ref        : clickedEmbedRef,
      title      : 'clicked counter',
      description: `clicked ${clickCount}`,
    }),
    Row(
      Button({
        label   : `clicked ${clickCount}`,
        disabled: !isResetDisabled,
        onClick : () => g(function * () {
          setClickCount(clickCount + 1);

          setClickedEmbed({description: `clicked ${clickCount + 1}`});

          if (clickCount >= 2) {
            setResetDisabled(false);
            openDialog(exampleDialog.name);
          }
        }),
      }),
    ),
    Row(
      Button({
        label   : `reset`,
        disabled: isResetDisabled,
        onClick : () => {
          setClickCount(1);
          setResetDisabled(true);
          // openView(exampleView2.name);
        },
      }),
    ),
    Row(
      Select({
        accessor   : pickMeRef,
        placeholder: 'Pick ME Choose ME Love ME',
        options    : [
          {
            label: 'Pick ME',
            value: 'op1',
          },
          {
            label: 'Choose ME',
            value: 'op2',
          },
          {
            label: 'Hawk Tuah',
            value: 'op3',
          },
        ],
        onClick: (values) => {
          console.log('Select', values);
        },
      }),
    ),
    Row(
      User({
        accessor   : selectRef,
        placeholder: 'Pick ME Choose ME Love ME',
        onClick    : (values) => {
          console.log('User', values);
        },
      }),
    ),
  ] as const;
};


const Example2 = () => {
  const [clickCount, setClickCount]         = useState('click', 0);
  const [isResetDisabled, setResetDisabled] = useState('reset', true);
  const openView                            = useMessageView();
  const openDialog                          = useDialogView();

  return [
    EmbedController({
      description: clickCount === 2 ? 'click reset' : 'init',
    }),
    Row(
      Button({
        label   : `example2: clicked ${clickCount}`,
        disabled: !isResetDisabled,
        onClick : () => {
          setClickCount(clickCount + 1);

          if (clickCount >= 2) {
            setResetDisabled(false);
            openDialog(exampleDialog.name);
          }
        },
      }),
    ),
    Row(
      Button({
        label   : `reset`,
        disabled: isResetDisabled,
        onClick : () => {
          setClickCount(0);
          setResetDisabled(true);
        },
      }),
    ),
  ] as const;
};


export const exampleView   = makeView('example', Example);
export const exampleView2  = makeView('example2', Example2);
export const exampleDialog = makeView('exampleDialog', ExampleDialog);


export const exampleDriver = Driver.make({
  name  : 'v3',
  slices: [],
  views : [
    exampleView,
    exampleDialog,
    exampleView2,
  ],
});
