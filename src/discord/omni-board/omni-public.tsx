import {Header} from '#src/discord/omni-board/components/header.tsx';
import {Auth, type TAuth} from '#src/disreact/enum/dauth.ts';
import {useEffect, useReducer, useState} from '#src/disreact/interface.ts';
import {Rest} from '#src/disreact/runtime/enum/index.ts';
import {E} from '#src/internal/pure/effect.ts';
// import {OmniPrivate} from '#src/discord/omni-board/omni-private.tsx';
// import {usePage} from '#src/disreact/model/danger.ts';



const useRefRest = () => {
  const thing = useState()
  useReducer()
}



const AuthCheck = (props: {auths: TAuth[], children: JSX.ElementType}) => {

  const rest = useInteraction() as Rest.Interaction;

  return rest.user?.mfa_enabled ? props.children : null;
}



export const OmniPublic = () => {
  // const setPage = usePage([OmniPrivate]);

  const [num, setNum] = useState(null);

  useEffect(() => {
    setNum(true)
  }, [num]);

  return (
    <AuthCheck >
      <message public>
        <Header
          title={'Omni Board'}
          description={'V2 - JSX Pragma'}
        />
        <buttons>
          <button
            primary
            label={'Start'}
            onclick={() => E.gen(function * () {

            })}
          />
          <button secondary label={'Help'}>
            <emoji
              name={'ope'}
            />
          </button>
        </buttons>
      </message>
    </AuthCheck>

  );
};
