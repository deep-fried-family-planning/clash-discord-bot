import {NavBar} from '#src/discord/components/nav-bar.tsx';
import {Link} from '#src/discord/omni-board/link.tsx';
import {NONE_STR} from '#src/disreact/codec/abstract/index.ts';
import {useIx, usePage, useState} from '#src/disreact/hook.ts';
import {MenuCache} from '#src/dynamo/cache/menu-cache.ts';
import {infoQueryByServer} from '#src/dynamo/operations/info.ts';
import {E, ORD, ORDN, ORDS, pipe} from '#src/internal/pure/effect.ts';
import {filterL, mapL, sortByL} from '#src/internal/pure/pure-list.ts';
import console from 'node:console';



export const InfoPanel = () => E.gen(function * () {
  const ix = useIx();
  const [infoKind, setInfoKind] = useState('about');
  const [embedId, setEmbedId] = useState(NONE_STR);
  const page = usePage([Link]);

  const infos = pipe(
    yield * infoQueryByServer({pk: ix.guild_id!}),
    filterL((i) => i.kind === infoKind),
    sortByL(
      ORD.mapInput(ORDN, (i) => i.selector_order ?? 100),
      ORD.mapInput(ORDS, (i) => i.selector_label ?? i.name ?? 'ope'),
      ORD.mapInput(ORD.Date, (i) => i.updated),
    ),
    mapL((i) => ({
      label      : i.selector_label ?? i.name!,
      description: i.selector_desc!,
      value      : i.embed_id!,
      default    : false,
    })),
  );

  console.log('infos', infos)

  if (embedId === NONE_STR) {
    setEmbedId(infos[0].value);
  }

  const {embed} = yield * MenuCache.embedRead(embedId === NONE_STR ? infos[0].value : embedId);

  return (
    <message ephemeral>
      <embed>
        <title>{'Info'}</title>
      </embed>
      <embed>
        <title>{embed.title}</title>
        <description>{embed.description}</description>
      </embed>
      <menu
        string
        onclick={(event) => {
          setInfoKind(event.data.values[0]);
          setEmbedId(NONE_STR);
        }}
      >
        <option label={'About'} value={'about'}/>
        <option label={'Help'} value={'help'}/>
        <option label={'Settings'} value={'settings'}/>
      </menu>
      <menu
        string
        onclick={(event) => {
          setEmbedId(event.data.values[0])
        }}
      >
        {infos.map((i) => (
          <option label={i.label} value={i.value} description={i.description} default={i.default}/>
        ))}
      </menu>
      <NavBar/>
      <buttons>
        <button
          primary
          label={'Back'}
          onclick={() => page.next(Link)}
        />
      </buttons>
    </message>
  );
});
