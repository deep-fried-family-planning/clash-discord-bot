import {CloseButton} from '#test/unit/components/close-button.tsx';

export const CloseMessage = () => {
  return (
    <message>
      <embed>
        {'Hello World!'}
      </embed>
      <actions>
        <CloseButton/>
      </actions>
    </message>
  );
};
