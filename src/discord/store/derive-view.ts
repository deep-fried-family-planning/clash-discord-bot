import {asSystem, embedIf} from '#src/discord/components/component-utils.ts';
import {CloseB} from '#src/discord/components/global-components.ts';
import type {St} from '#src/discord/store/derive-state.ts';
import {toReferenceFieldssssss} from '#src/discord/views/util.ts';
import {equalField} from '#src/dynamo/schema/discord-embed.ts';
import type {IxRE} from '#src/internal/discord.ts';
import {pipe} from '#src/internal/pure/effect.ts';
import {dedupeWithL, filterL} from '#src/internal/pure/pure-list.ts';
import {UI} from 'dfx';
import type {Embed} from 'dfx/types';



export const deriveView = (s: St) => {
  const embeds = [
    s.title
      ? asSystem({
        fields: pipe(
          [
            ...s.system ?? [],
            ...toReferenceFieldssssss(s.reference),
          ],
          dedupeWithL(equalField),
        ),
        title      : s.title,
        description: s.description!,
      })
      : undefined,
    embedIf(s.viewer, s.viewer),
    embedIf(s.editor, s.editor),
    embedIf(s.status, s.status),
  ].filter(Boolean) as Embed[];

  const components = pipe(
    [
      [s.navigate?.component].filter(Boolean),

      s.row1?.filter(Boolean).map((c) => c?.component),
      [s.sel1?.component].filter(Boolean),

      s.row2?.filter(Boolean).map((c) => c?.component),
      [s.sel2?.component].filter(Boolean),

      s.row3?.filter(Boolean).map((c) => c?.component),
      [s.sel3?.component].filter(Boolean),

      [
        s.submit?.component,
        s.delete?.component,
        s.back?.component,
        s.next?.component,
        s.forward?.component,
        CloseB.component,
      ].filter(Boolean),
    ] as const,
    filterL((cs) => Boolean(cs?.length)),
  );

  if (!components.length) {
    return {
      embeds: embeds,
    } satisfies Partial<IxRE>;
  }


  return {
    embeds    : embeds,
    components: UI.grid(components as UI.UIComponent[][]),
  } satisfies Partial<IxRE>;
};
