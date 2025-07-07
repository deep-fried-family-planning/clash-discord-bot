import * as Effect from 'effect/Effect';

export const MyCompo2 = () => Effect.gen(function* () {
  return yield* Effect.fail(new Error());

  return <code></code>;
});

export const MyCompo = (props) => Effect.gen(function* () {
  return <code>
    <MyCompo2/>
  </code>;
});

export const MyCompo3 = () => Effect.gen(function* () {
  return yield* Effect.succeed(MyCompo2);
});

export const MyCompo4 = () => Effect.gen(function* () {
  return yield* <MyCompo2/>;
});

export const MyCompo5 = () =>
  <MyCompo2/>;

const thing = <MyCompo2/>;
