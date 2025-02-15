import {CloseButton} from '#src/discord/components/close-button.tsx';



export const NavBar = () => {
  return (
    <buttons>
      <button
        primary
        label={'Home'}
      />
      <CloseButton/>
    </buttons>
  );
};
