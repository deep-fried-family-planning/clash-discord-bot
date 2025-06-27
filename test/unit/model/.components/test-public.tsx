import * as Effect from 'effect/Effect';

type EmbedProps = {

}

export const TestEmbed = (props: EmbedProps) => {
  props
};

type PublicProps = {

}

export const TestPublicSync = (props: PublicProps) => {};

export const TestPublicAsync = (props: PublicProps) => {};

export const TestPublicEffect = Effect.fn(function* (props: PublicProps) {

  return (<message>

  </message>)
});
