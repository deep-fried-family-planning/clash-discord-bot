import {NavBar} from '#src/discord/components/nav-bar.tsx';
import {NONE_STR} from '#src/disreact/codec/abstract/index.ts';
import {useEffect, useState} from '#src/disreact/interface/hook.ts';



export const InfoPanel = () => {
  const [infoKind, setInfoKind] = useState('About');
  const [infoId, setInfoId] = useState(NONE_STR);
  const [infoOptions, setInfoOptions] = useState([]);

  useEffect(
    () => {

    },
    [infoKind, infoId],
  );

  return (
    <message ephemeral>
      <embed>
        <title>{'Info'}</title>
      </embed>
      <embed>
        <title>{'Info'}</title>
        <description>
          {'Info'}
        </description>
      </embed>
      <menu string>
        <option label={'About'} value={'About'}/>
        <option label={'Help'} value={'Help'}/>
        <option label={'Settings'} value={'Settings'}/>
      </menu>
      <menu string>
        {infoOptions.map((iO) => (
          <option/>
        ))}
      </menu>
      <NavBar/>
    </message>
  );
};
