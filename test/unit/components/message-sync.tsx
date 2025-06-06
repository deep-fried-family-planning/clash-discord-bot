import {ButtonAsync} from '#test/unit/components/button-async.tsx';
import {ButtonEffect} from '#test/unit/components/button-effect.tsx';
import {ButtonSync} from '#test/unit/components/button-sync.tsx';

export const MessageSync = (p) => {
  return (
    <message>
      <embed>
        {'MessageSync'}
      </embed>
      <actions>
        <ButtonSync/>
        <ButtonAsync/>
        <ButtonEffect/>
      </actions>
    </message>
  );
};
