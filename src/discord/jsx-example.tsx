import {useStateTest} from '#disreact/model/hooks/hooks.ts';
import {useSwitch} from '#disreact/model/static-graph/use-switch.ts';
import type {str} from '#src/internal/pure/types-pure.ts';



export const JsxExample = () => {
  const [thing, setThing] = useStateTest('1');
  const switchTo          = useSwitch([
    SubComponent,
  ]);

  setThing(thing);

  // switchTo(SubComponent);

  return (
    <message>
      <>
        <components>
          <button custom_id={'1'} label={'src:intrinsic element'} />
          <button custom_id={'2'} label={'src:intrinsic element2'} onClick={() => {
            setThing('2');
            switchTo(SubComponent);
          }}/>
          <>
            <button custom_id={'3'} label={'src:react fragment'}/>
          </>
          <SubComponent doesThisWork={'work'}/>
        </components>
      </>
    </message>
  );
};


export const ExampleDialog = () => {
  const [thing, setThing] = useStateTest('1');
  const switchTo          = useSwitch([
    SubComponent,
  ]);

  setThing(thing);

  // switchTo(SubComponent);

  return (
    <dialog>
      <>
        <text label={'ope'}/>
        <text label={'ope2'}/>
        <components>
          <button style={5}/>
          <button style={5} onClick={() => {
            setThing('2');
            switchTo(SubComponent);
          }}/>
          <>
            <button style={5}/>
          </>
          <SubComponent doesThisWork={'work'}/>
        </components>
      </>
    </dialog>
  );
};



export const SubComponent = (props: {doesThisWork: str}) => {
  return (
    <button custom_id={'from function component'} label={'src:function component ref'}>

    </button>
  );
};


JsxExample();
