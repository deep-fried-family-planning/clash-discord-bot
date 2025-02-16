import {translations} from '#src/discord/omni-board/translations.ts';
import {NONE_STR} from '#src/disreact/codec/abstract/index.ts';
import {useEffect, useState} from '#src/disreact/interface/hook.ts';
import {MenuCache} from '#src/dynamo/cache/menu-cache.ts';
import type {DEmbed} from '#src/dynamo/schema/discord-embed.ts';
import {E} from '#src/internal/pure/effect.ts';

type Props = {
  embedId?: string;
}


export const InfoEmbed: DSX.FC<Props> = (props) => {
  const [dEmbed, setDEmbed] = useState(null as null | DEmbed);

  useEffect(E.gen(function * () {
    if (props.embedId && props.embedId !== NONE_STR) {
      const resp = yield * MenuCache.embedRead(props.embedId);
      setDEmbed(resp);
    }
  }), []);

  return (
    <embed>
      <title>
        {dEmbed?.embed?.title ?? translations.LOADING}
      </title>
      <description>
        {dEmbed?.embed?.description ?? translations.LOADING}
      </description>
    </embed>
  );
};
