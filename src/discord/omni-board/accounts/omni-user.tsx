import * as E from 'effect/Effect';

export const OmniUser = () => E.gen(function* () {
  return (
    <ephemeral>
      <embed
        title={'Account Links'}
      />
    </ephemeral>
  );
});
