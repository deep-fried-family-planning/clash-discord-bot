import {useNext} from '#disreact/interface/dev.ts';
import {DA} from '#disreact/virtual/entities/index.ts';



export const TestComponent = () => {
  const [nodes, setNext] = useNext({Noice, Kick})

  return (
    <Message>
      <markdown>
        <at variant={'user'} id={'123456789'}/>
        <br/>
        <p>{'Did you do your damn hits?'}</p>
      </markdown>
      <row>
        <button
          style={DA.En.Button.PRIMARY}
          label={'Yes'}
          onClick={() => setNext(nodes.Noice)}
        />
        <button
          style={DA.En.Button.DANGER}
          label={'No'}
          onClick={() => setNext(nodes.Kick)}
        />
      </row>
    </Message>
  );
}


const Message = (props) => {
  return (
    <message>
      {props.children}
    </message>
  )
}





const Kick = () => {
  return (
    <message>
      {props.children}
    </message>
  )
}



const Noice = () => {
  return (
    <message>
      {props.children}
    </message>
  )
}
