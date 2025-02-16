import {CloseButton} from '#src/discord/components/close-button.tsx';
import console from 'node:console';



export const NavBar = () => {
  return (
    <buttons>
      <button
        primary
        label={'Home'}
        onclick={() => {console.log('HOME')}}
      />
      <CloseButton/>
    </buttons>
  );
};
