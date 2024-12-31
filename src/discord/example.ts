import {makeDriver} from '#discord/context/model-driver.ts';
import {Cv, Ev} from '#discord/entities';
import {ParagraphText, ShortText} from '#discord/entities/component-view.ts';
import {DialogHeader, makeDialog, makeMessage} from '#discord/entities/node-view.ts';
import {useComponentRef} from '#discord/hooks/use-component-ref.ts';
import {useDialogRef} from '#discord/hooks/use-dialog-ref.ts';
import {useRestEmbedRef} from '#discord/hooks/use-embed-ref.ts';
import {useState} from '#discord/hooks/use-state.ts';
import {useDialogView, useMessageView} from '#discord/hooks/use-view.ts';
import {g} from '#pure/effect';
import type {str} from '#src/internal/pure/types-pure.ts';
import console from 'node:console';


const useEmbedEditorDescription = useDialogRef(
  'embed.description',
  (embed) => {
    return {value: embed.description!};
  },
  (text) => {
    return {description: text.value!};
  },
);


export const EmbedEditor = (props: {title: str}) => {
  const descriptionId = useEmbedEditorDescription();

  return Ev.DialogLinked({
    title: props.title,
    refs : [
      descriptionId,
    ],
  });
};


const ExampleDialog = () => {
  const descriptionId = useEmbedEditorDescription();
  const openView      = useMessageView();

  return [
    DialogHeader({
      title   : 'ExampleDialog',
      onSubmit: () => {
        openView(exampleView);
      },
    }),
    ShortText({
      ref  : descriptionId,
      label: 'ope',
    }),
    ParagraphText({
      label: 'ope2',
    }),
  ] as const;
};


const Example = () => {
  const [clickCount, setClickCount]         = useState('click', 0);
  const [isResetDisabled, setResetDisabled] = useState('reset', true);
  const openDialog                          = useDialogView();
  const [clickedEmbedRef, setClickedEmbed]  = useRestEmbedRef('clicked');
  const selectRef                           = useComponentRef('users');
  const pickMeRef                           = useComponentRef('pick_me');

  return [
    Ev.Controller({
      description: clickCount === 2 ? 'click reset' : 'init',
    }),
    EmbedEditor({
      title: 'editor',
    }),
    Ev.Basic({
      ref        : clickedEmbedRef,
      title      : 'clicked counter',
      description: `clicked ${clickCount}`,
    }),
    Cv.Row(
      Cv.Button({
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
    Cv.Row(
      Cv.Button({
        label   : `reset`,
        disabled: isResetDisabled,
        onClick : () => {
          setClickCount(1);
          setResetDisabled(true);
          // openView(exampleView2.name);
        },
      }),
    ),
    Cv.Select({
      ref        : pickMeRef,
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
    Cv.User({
      ref        : selectRef,
      placeholder: 'Pick ME Choose ME Love ME',
      onClick    : (values) => {
        console.log('User', values);
      },
    }),
  ] as const;
};


const Example2 = () => {
  const [clickCount, setClickCount]         = useState('click', 0);
  const [isResetDisabled, setResetDisabled] = useState('reset', true);
  const openDialog                          = useDialogView();

  return [
    Ev.Controller({
      description: clickCount === 2 ? 'click reset' : 'init',
    }),
    Cv.Row(
      Cv.Button({
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
    Cv.Row(
      Cv.Button({
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


export const exampleView   = makeMessage('example', Example);
export const exampleView2  = makeMessage('example2', Example2);
export const exampleDialog = makeDialog('exampleDialog', ExampleDialog);


export const exampleDriver = makeDriver({
  name  : 'v3',
  slices: [],
  views : [
    exampleView,
    exampleDialog,
    exampleView2,
  ],
});
