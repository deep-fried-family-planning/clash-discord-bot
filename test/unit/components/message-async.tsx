import {ButtonAsync} from '#test/unit/components/button-async.tsx';
import {ButtonEffect} from '#test/unit/components/button-effect.tsx';
import {ButtonSync} from '#test/unit/components/button-sync.tsx';

export const MessageAsync = async () => {
  return (
    <ephemeral>
      <embed>
        {'MessageAsync'}
      </embed>
      <actions>
        <ButtonSync/>
        <ButtonAsync/>
        <ButtonEffect/>
      </actions>
    </ephemeral>
  );
};
