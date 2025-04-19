import {E} from '#src/disreact/utils/re-exports';
import {ButtonAsync} from '#test/unit/components/button-async.tsx';
import {ButtonEffect} from '#test/unit/components/button-effect.tsx';
import {ButtonSync} from '#test/unit/components/button-sync.tsx';

export const MessageEffect = () => E.gen(function* () {
  return (
    <ephemeral>
      <embed>
        {'EphemeralEffect'}
      </embed>
      <actions>
        <ButtonSync/>
        <ButtonAsync/>
        <ButtonEffect/>
      </actions>
    </ephemeral>
  );
});
