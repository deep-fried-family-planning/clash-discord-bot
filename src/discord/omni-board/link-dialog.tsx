import type {FC} from '#src/disreact/jsx-runtime.ts';



export const LinkDialog: FC = () => {
  return (
    <modal
      title={'Testing'}
      onsubmit={() => {

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

LinkDialog.isSync;
