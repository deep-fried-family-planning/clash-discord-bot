import console from 'node:console';



export const LinkDialog = () => {
  return (
    <modal
      title={'Testing'}
      onsubmit={() => {
        console.log('SUBMIT');
      }}
    >
      <text label={'Testing1'} value={''}/>
      <text label={'Testing2'} value={''}/>
      <text label={'Testing3'} value={''}/>
      <text label={'Testing4'} value={''}/>
      <text label={'Testing5'} value={''}/>
    </modal>
  );
};
