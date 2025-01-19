import {E, g} from '#pure/effect';
import {Auth, UnsafeCall} from '#src/internal/disreact/entity/index.ts';
import {makeUseState} from '#src/internal/disreact/entity/interface-hook.ts';
import {CI, ConI, EI, HI} from '#src/internal/disreact/interface/index.ts';
import {DisReact} from '#src/internal/disreact/runtime/create-disreact.ts';
import console from 'node:console';


const Mutual = () => {
  const [title, setTitle] = makeUseState(0);
  const [nodes, setNext] = HI.useNext({Test });


  return ConI.makePrivate(
    EI.Header({
      title      : 'Mutual',
      description: `${title}`,
    }),
    CI.Row(
      CI.PrimaryButton({
        label  : `Does it work? ${title}`,
        onClick: (event) => g(function * () {
          yield * E.logDebug('effect hello world!');
          console.log(event);
          setTitle(title + 1);
        }),
      }),
      CI.SuccessButton({
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
  const [next, setRoute] = HI.useNext({Mutual});


  return ConI.makePrivate(
    EI.Header({
      title      : 'Mutex',
      description: title,
    }),
    CI.Row(
      CI.PrimaryButton({
        auths  : [Auth.T.MFA()],
        label  : 'Hello World',
        onClick: () => {
          setTitle('it works!');
        },
      }),
      CI.SuccessButton({
        label  : 'Test',
        onClick: () => {
          setRoute(next.Mutual);
        },
      }),
      CI.DangerButton({
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
  const [next, setRoute] = HI.useNext({Test, Mutual});


  return ConI.makePublic(
    EI.Header({
      title      : 'Starter',
      description: title,
    }),
    CI.Row(
      CI.PrimaryButton({
        label  : 'Hello World',
        onClick: () => {
          console.log('hello world!!!');
          setTitle('it works!');
        },
      }),
      CI.SuccessButton({
        label  : 'Next',
        onClick: () => {
          setRoute(next.Test);
        },
      }),
    ),
  );
};


export const DeepFryerDisReact = DisReact.makeLayer({Starter});
