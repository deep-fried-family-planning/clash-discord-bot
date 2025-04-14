import {usePage} from '#src/disreact/index.ts';
import {SimpleModal} from '#test/unit/runtime/scenarios/.components/simple-modal.tsx';

export const SimpleMessage = () => {
  const page = usePage([SimpleModal]);

  return (
    <message>
      <embed>{'Hello World!'}</embed>
      <actions>
        <primary
          custom_id={'OpenModal'}
          label={'Modal'}
          onclick={() => {
            page.next(SimpleModal);
          }}
        />
      </actions>
    </message>
  );
};
