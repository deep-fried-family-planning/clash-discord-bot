import {Auth} from '#src/internal/disreact/entity/index.ts';
import {PrimaryButton, Row, SecondaryButton} from '#src/internal/disreact/entity/interface-component.ts';
import {Controller} from '#src/internal/disreact/entity/interface-embed.ts';
import {makeUseRoute, makeUseState} from '#src/internal/disreact/entity/interface-hook.ts';
import {Entrypoint, Ephemeral} from '#src/internal/disreact/index.ts';


const Mutual = () => {
  const [title, setTitle] = makeUseState('nope');
  const [nodes, setNext] = makeUseRoute({Test, Starter});


  return Ephemeral(
    Controller({
      title      : 'Mutual',
      description: title,
    }),
    Row(
      PrimaryButton({
        label  : 'Hello World',
        onClick: () => {
          setTitle('it works!');
        },
      }),
      SecondaryButton({
        label  : 'Next',
        onClick: () => {
          setNext(nodes.Starter);
        },
      }),
    ),
  );
};


const Test = () => {
  const [title, setTitle] = makeUseState('nope');
  const [next, setRoute] = makeUseRoute({Mutual});


  return Ephemeral(
    Controller({
      title      : 'Test',
      description: title,
    }),
    Row(
      PrimaryButton({
        auth   : [Auth.T.MFA()],
        label  : 'Hello World',
        onClick: () => {
          setTitle('it works!');
        },
      }),
      SecondaryButton({
        label  : 'Next',
        onClick: () => {
          setRoute(next.Mutual);
        },
      }),
    ),
  );
};


export const Starter = () => {
  const [title, setTitle] = makeUseState('nope');
  const [next, setRoute] = makeUseRoute({Test, Mutual});


  return Entrypoint(
    Controller({
      title      : 'Starter',
      description: title,
    }),
    Row(
      PrimaryButton({
        label  : 'Hello World',
        onClick: () => {
          setTitle('it works!');
        },
      }),
      SecondaryButton({
        label  : 'Next',
        onClick: () => {
          setRoute(next.Test);
        },
      }),
    ),
  );
};
