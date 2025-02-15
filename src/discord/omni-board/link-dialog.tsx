import console from 'node:console';



export const LinkDialog = () => {
  return (
    <modal
      title={'Testing'}
      onsubmit={() => {
        console.log('SUBMIT');
      }}
    >
      <text label={'Testing1'}/>
      <text label={'Testing2'}/>
      <text label={'Testing3'}/>
      <text label={'Testing4'}/>
      <text label={'Testing5'}/>
    </modal>
  );
};
