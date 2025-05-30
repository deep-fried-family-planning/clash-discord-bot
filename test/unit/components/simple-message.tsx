import {usePage} from '#src/disreact/index.ts';
import {SimpleModal} from '#test/unit/components/simple-modal.tsx';

export const SimpleMessage = (props) => {
  const page = usePage();
  console.log(props);
  console.log(props.title);
  return (
    <message>
      <embed>{'Hello World!'}</embed>
      {props.title && <embed>{props.title}</embed>}
      <actions>
        <primary
          custom_id={'OpenModal'}
          label={'Modal'}
          onclick={() => {
            console.log('OpenModal');
            page.next(SimpleModal, {});
          }}
        />
      </actions>
    </message>
  );
};
