import {Auth, UnsafeCall} from '#src/internal/disreact/entity/index.ts';
import {DangerButton, PrimaryButton, Row, SecondaryButton} from '#src/internal/disreact/entity/interface-component.ts';
import {Controller} from '#src/internal/disreact/entity/interface-embed.ts';
import {makeUseRoute, makeUseState} from '#src/internal/disreact/entity/interface-hook.ts';
import {Entrypoint, EphemeralEntrypoint} from '#src/internal/disreact/index.ts';
import console from 'node:console';


const Mutual = () => {
  const [title, setTitle] = makeUseState(0);
  const [nodes, setNext] = makeUseRoute({Test });


  return EphemeralEntrypoint(
    Controller({
      title      : 'Mutual',
      description: `${title}`,
    }),
    Row(
      PrimaryButton({
        label  : `Does it work? ${title}`,
        onClick: (event) => {
          console.log(event);
          setTitle(title + 1);
        },
      }),
      SecondaryButton({
        label  : 'Mutex',
        onClick: () => {
          setNext(nodes.Test);
        },
      }),
    ),
  );
};


const Test = () => {
  const [title, setTitle] = makeUseState('nope');
  const [next, setRoute] = makeUseRoute({Mutual});


  return EphemeralEntrypoint(
    Controller({
      title      : 'Mutex',
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
        label  : 'Test',
        onClick: () => {
          setRoute(next.Mutual);
        },
      }),
      DangerButton({
        label  : 'Close',
        onClick: () => {
          UnsafeCall.setNextClose(true);
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
          console.log('hello world!!!');
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
