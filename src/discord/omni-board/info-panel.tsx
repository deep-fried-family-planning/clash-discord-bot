import {NavBar} from '#src/discord/components/nav-bar.tsx';
import {InfoEmbed} from '#src/discord/omni-board/info-embed.tsx';
import {translations} from '#src/discord/omni-board/translations.ts';
import {NONE_STR} from '#src/disreact/codec/abstract/index.ts';
import { useIx, useState} from '#src/disreact/interface/hook.ts';



export const InfoPanel = () => {
  const [infoKind, setInfoKind] = useState('about');
  const [infoId, setInfoId] = useState(NONE_STR);
  const [infoOptions, setInfoOptions] = useState([]);
  const ix = useIx();

  return (
    <message ephemeral>
      <embed>
        <title>{translations.INFO}</title>
      </embed>
      <InfoEmbed embedId={infoId}/>
      <menu
        string
        onclick={(event) => {
          ix
        }}
      >
        <option label={translations.ABOUT} value={'ABOUT'} default={infoKind === 'ABOUT'}/>
        <option label={translations.SERVER_GUIDE} value={'SERVER_GUIDE'} default={infoKind === 'SERVER_GUIDE'}/>
        <option label={translations.RULES} value={'RULES'} default={infoKind === 'RULES'}/>
      </menu>
      {/*<menu string>*/}
      {/*  {infoOptions.map((iO) => (*/}
      {/*    <option/>*/}
      {/*  ))}*/}
      {/*</menu>*/}
      <NavBar/>
    </message>
  );
};
