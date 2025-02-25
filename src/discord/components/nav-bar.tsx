import {CloseButton} from '#src/discord/components/close-button.tsx';



export const NavBar = () => {
  return (
    <actions>
      <button
        primary
        label={'Home'}
      />
      <CloseButton/>
    </actions>
  );
};
