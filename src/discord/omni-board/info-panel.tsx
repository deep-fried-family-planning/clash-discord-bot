import {NavBar} from '#src/discord/components/nav-bar.tsx';
import {Link} from '#src/discord/omni-board/link.tsx';
import {EMPTY} from '#src/disreact/codec/constants/common.ts';
import type {FC} from '#src/disreact/codec/element/function-component.ts';
import {useIx, usePage, useState} from '#src/disreact/index.ts';
import {MenuCache} from '#src/dynamo/cache/menu-cache.ts';
import {infoQueryByServer} from '#src/dynamo/operations/info.ts';
import {E, ORD, ORDN, ORDS, pipe} from '#src/internal/pure/effect.ts';
import {filterL, mapL, sortByL} from '#src/internal/pure/pure-list.ts';



export const InfoPanel: FC<{description?: string}> = (props) => E.gen(function* () {
  const ix                      = useIx();
  const [infoKind, setInfoKind] = useState('about');
  const [embedId, setEmbedId]   = useState(EMPTY);
  const page                    = usePage([Link]);

  const infos = pipe(
    yield* infoQueryByServer({pk: ix.guild_id!}),
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

  if (embedId === EMPTY) {
    setEmbedId(infos[0].value);
  }

  const {embed} = yield* MenuCache.embedRead(embedId === EMPTY ? infos[0].value : embedId);

  return (
    <message ephemeral>
      <embed title={'Info'}>
      </embed>
      <embed title={embed.title}>
        {props.description ?? embed.description}
      </embed>
      <select
        onselect={(event: any) => {
          setInfoKind(event.values[0]);
          setEmbedId(EMPTY);
        }}
      >
        <option label={'About'} value={'about'} default={infoKind === 'about'}/>
        <option label={'Help'} value={'help'} default={infoKind === 'help'}/>
        <option label={'Settings'} value={'settings'} default={infoKind === 'settings'}/>
      </select>
      <select
        onselect={(event: any) => {
          setEmbedId(event.values[0]);
        }}
      >
        {infos.map((i) => (
          <option label={i.label} value={i.value} description={i.description} default={i.default}/>
        ))}
      </select>
      <NavBar/>
      <actions>
        <button
          primary
          label={'Back'}
          onclick={() => {
            page.next(Link, {});
          }}
        />
      </actions>
    </message>
  );
});

InfoPanel.displayName = '';
