import {Button, Row, Text} from '#discord/entities-basic/cxv.ts';
import {EmbedController} from '#discord/entities-basic/exv.ts';
import {makeView} from '#discord/entities-basic/view.ts';
import {useState, useView} from '#discord/hooks/context.ts';
import {cxRouter} from '#discord/model-routing/ope.ts';
import {StyleT} from '#pure/dfx';
import console from 'node:console';
import {Driver} from '.';


const ExampleDialog = () => {
  return [
    {
      title    : 'ExampleDialog',
      custom_id: cxRouter.build({
        root: 'v3',
        view: 'exampleDialog',
        row : '-',
        col : '-',
      }),
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
      description: clickCount === 5 ? 'click reset' : 'init',
    }),
    Row(
      Button({
        label   : `clicked ${clickCount}`,
        disabled: !isResetDisabled,
        onClick : () => {
          setClickCount(clickCount + 1);

          if (clickCount >= 4) {
            console.log('here');
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
export const exampleDialog = makeView('exampleDialog', ExampleDialog);


export const exampleDriver = Driver.make({
  name  : 'v3',
  slices: [],
  views : [
    exampleView,
    exampleDialog,
  ],
});
