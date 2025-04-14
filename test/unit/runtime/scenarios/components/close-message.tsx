import {CloseButton} from '#test/unit/runtime/scenarios/components/close-button.tsx';

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
