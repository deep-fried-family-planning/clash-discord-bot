import {openDialog, useDialogView, useMessageView} from '#src/internal/disreact/constants/hooks/use-view.ts';
import {useRefComponent, useRefDialog, useRefEmbed, useState} from '#src/internal/disreact/context/hooks/interface.ts';
import {makeDriver} from '#src/internal/disreact/context/old/model-driver.ts';
import {ParagraphText, ShortText} from '#src/internal/disreact/entity/interface-component.ts';
import {Controller} from '#src/internal/disreact/entity/interface-embed.ts';
import {DialogHeader, makeDialog, makeMessage} from '#src/internal/disreact/entity/node-view.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import console from 'node:console';
import {Cv, Ev} from 'src/internal/disreact/entity';


const useEmbedEditorDescription = useRefDialog(
  // 'embed.description',
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
  const [clickCount, setClickCount]         = useState(0);
  const [isResetDisabled, setResetDisabled] = useState(true);
  const clickedEmbedRef  = useRefEmbed();
  const selectRef                           = useRefComponent();
  const pickMeRef                           = useRefComponent();

  return [
    Controller({
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
      Cv._Button({
        label   : `clicked ${clickCount}`,
        disabled: !isResetDisabled,
        onClick : () =>  {
          setClickCount(clickCount + 1);
          // setClickedEmbed({description: `clicked ${clickCount + 1}`});

          if (clickCount >= 1) {
            setResetDisabled(false);
          }

          if (clickCount >= 2) {
            openDialog(exampleDialog.name);
          }
        },
      }),
    ),
    Cv.Row(
      Cv._Button({
        label   : `reset`,
        disabled: isResetDisabled,
        onClick : () => {
          setClickCount(0);
          setResetDisabled(true);
          // openView(exampleView2.name);
        },
      }),
    ),
    Cv._Select({
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
      },
    }),
    Cv._User({
      ref        : selectRef,
      placeholder: 'Pick ME Choose ME Love ME',
      onClick    : (values) => {
        console.log('User', values);
      },
    }),
  ] as const;
};


const Example2 = () => {
  const [clickCount, setClickCount]         = useState(0);
  const [isResetDisabled, setResetDisabled] = useState(true);
  const openDialog                          = useDialogView();

  return [
    Ev.Controller({
      description: clickCount === 2 ? 'click reset' : 'init',
    }),
    Cv.Row(
      Cv._Button({
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
      Cv._Button({
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
