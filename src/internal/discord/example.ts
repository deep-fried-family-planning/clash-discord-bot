import {Button, Row, Text} from '#discord/entities/cxv.ts';
import {AccessorEmbed, EmbedController} from '#discord/entities/exv.ts';
import {makeView} from '#discord/entities/view.ts';
import {useAccessor} from '#discord/hooks/use-accessor.ts';
import {useState} from '#discord/hooks/use-state.ts';
import {useDialogView, useMessageView} from '#discord/hooks/use-view.ts';
import {CxPath} from '#discord/routing/cx-path.ts';
import {StyleT} from '#pure/dfx';
import type {str} from '#src/internal/pure/types-pure.ts';
import console from 'node:console';
import {Driver} from '.';


// const [state, dispatch] = useReducer(
//   g(function * () {
//     yield * ClashKing.previousWars();
//   }),
//   {
//     receivedSignups: (_, action) => {
//       return action;
//     },
//     signupAccount: (state, action) => {
//       return state;
//     },
//   },
// );
//
// useEffect('initReducer', () => {
//   dispatch('receivedSignups', promiseOutput);
// });
//
//
// useLinkedComponent()


const useEmbedEditorDescription = useAccessor(
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


  return [
    EmbedController({
      description: clickCount === 2 ? 'click reset' : 'init',
    }),
    EmbedEditor({
      title: 'editor',
    }),
    Row(
      Button({
        label   : `clicked ${clickCount}`,
        disabled: !isResetDisabled,
        onClick : () => {
          setClickCount(clickCount + 1);

          console.log('clicked');

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
          setClickCount(1);
          setResetDisabled(true);
          // openView(exampleView2.name);
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
