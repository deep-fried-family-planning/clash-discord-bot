import {ClashOfClans} from '#src/clash/clashofclans.ts';
import {ServerClan} from '#src/database/data/codec';
import {readPartition} from '#src/database/db.ts';
import {ForwardB, PrimaryB, SingleS} from '#src/internal/discord-old/components/global-components.ts';
import {RK_OPEN, RK_UPDATE} from '#src/internal/discord-old/constants/route-kind.ts';
import type {Ax} from '#src/internal/discord-old/store/derive-action.ts';
import type {St} from '#src/internal/discord-old/store/derive-state.ts';
import {makeId} from '#src/internal/discord-old/store/type-rx.ts';
import {E, ORD, ORDNR, ORDS, pipe} from '#src/internal/pure/effect.ts';
import {mapL, sortByL, sortWithL, zipL} from '#src/internal/pure/pure-list.ts';

const getClans = (s: St) => E.gen(function* () {
  const records = pipe(
    yield* readPartition(ServerClan, s.server_id),
    sortWithL((r) => r.sk, ORDS),
  );

  const clans = pipe(
    yield* ClashOfClans.getClans(records.map((r) => r.sk)),
    sortWithL((c) => c.tag, ORDS),
  );

  return pipe(
    zipL(records, clans),
    sortByL(
      ORD.mapInput(ORDNR, ([, c]) => c.level),
      ORD.mapInput(ORDS, ([, c]) => c.name),
      ORD.mapInput(ORDS, ([r]) => r.sk),
    ),
    mapL(([r, c]) => ({
      label      : `[lvl${c.level}]  ${c.name}`,
      description: `tag: ${c.tag}, verification_level: ${r.verification}`,
      value      : c.tag,
    })),
  );
});

export const ClanSelectB = PrimaryB.as(makeId(RK_OPEN, 'CLAN'), {label: 'Select Clan'});
const ClanS = SingleS.as(makeId(RK_UPDATE, 'CLAN'), {placeholder: 'Select Clan'});

const view = (s: St, ax: Ax) => E.gen(function* () {
  const selected = ax.selected.map((s) => s.value);

  let Clan = ClanS.fromMap(s.cmap);

  if (ClanSelectB.clicked(ax)) {
    Clan = Clan.render({
      options: yield* getClans(s),
    });
  }

  Clan = Clan.setDefaultValuesIf(ax.id.predicate, selected);

  const Forward
          = ForwardB.fromMap(s.cmap)
    ?? ForwardB.forward(ax.id);

  return {
    ...s,
    title  : 'Select Clan',
    sel1   : Clan,
    forward: Forward
      .addForward(Clan.values[0])
      .render({
        disabled: Clan.values.length === 0,
      }),
  } satisfies St;
});

export const clanSelectReducer = {
  [ClanSelectB.id.predicate]: view,
  [ClanS.id.predicate]      : view,
};
