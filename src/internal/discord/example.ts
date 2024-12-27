import {Button, Row, Text} from '#discord/entities/cxv.ts';
import {EmbedController} from '#discord/entities/exv.ts';
import {makeView} from '#discord/entities/view.ts';
import {useState, useView} from '#discord/hooks/context.ts';
import {v2Router} from '#discord/model-routing/ope.ts';
import {StyleT} from '#pure/dfx';
import {Driver} from '.';


const ExampleDialog = () => {
  return [
    {
      title: 'ExampleDialog',
      route: v2Router.empty(),
    },
    Row(
      Text({
        label: 'ope',
        style: StyleT.PARAGRAPH,
      }),
    ),
  ] as const;
};


const Example = () => {
  const [clickCount, setClickCount]         = useState('click', 0);
  const [isResetDisabled, setResetDisabled] = useState('reset', true);
  const [openView, openDialog]              = useView();


  return [
    EmbedController({
      description: clickCount === 2 ? 'click reset' : 'init',
    }),
    Row(
      Button({
        label   : `clicked ${clickCount}`,
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
          setClickCount(1);
          setResetDisabled(true);
          openView(exampleView2.name);
        },
      }),
    ),
  ] as const;
};


const Example2 = () => {
  const [clickCount, setClickCount]         = useState('click', 0);
  const [isResetDisabled, setResetDisabled] = useState('reset', true);
  const [openView, openDialog]              = useView();


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
