import { E } from '#src/disreact/utils/re-exports';
import console from 'node:console';

export const Thing = E.gen(function* () {
  return (
    <>
      <message></message>
      <message></message>
      {[0, 0].map(() => <message></message>)}
    </>
  );
});

export const AnothaOne = E.gen(function* () {
  return (
    <>
      <message></message>
      <message></message>
      <Thing/>
    </>
  );
});
