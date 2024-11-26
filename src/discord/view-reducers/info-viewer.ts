import {BackB, PrimaryB, SingleS} from '#src/discord/components/global-components.ts';
import {makeId} from '#src/discord/store/type-rx.ts';
import {E, ORD, ORDN, ORDS, pipe} from '#src/internal/pure/effect.ts';
import {asViewer, unset} from '#src/discord/components/component-utils.ts';
import {OmbiBoardB} from '#src/discord/view-reducers/omni-board.ts';
import {InfoViewerAdminB} from '#src/discord/view-reducers/info-viewer-admin.ts';
import type {snflk} from '#src/discord/types.ts';
import {InfoViewerCreatorB} from '#src/discord/view-reducers/info-viewer-creator.ts';
import {infoQueryByServer} from '#src/dynamo/operations/info.ts';
import {filterL, mapL, sortByL} from '#src/internal/pure/pure-list.ts';
import type {Embed} from 'dfx/types';
import {SELECT_INFO_KIND, UNAVAILABLE} from '#src/discord/ix-constants.ts';
import {viewInfoEmbed} from '#src/discord/components/views/info-embed.ts';
import {MenuCache} from '#src/dynamo/cache/menu-cache.ts';
import {RK_OPEN, RK_UPDATE} from '#src/internal/constants/route-kind.ts';
import type {St} from '#src/discord/store/derive-state.ts';
import type {Ax} from '#src/discord/store/derive-action.ts';
import {DELIM_DATA} from '#src/internal/constants/delim.ts';
import {LABEL_INFO, LABEL_TITLE_INFO} from '#src/internal/constants/label.ts';
import {PLACEHOLDER_INFO_EMBED, PLACEHOLDER_INFO_KIND} from '#src/internal/constants/placeholder.ts';


export const InfoViewerB = PrimaryB.as(makeId(RK_OPEN, 'IV'), {
    label: LABEL_INFO,
});
export const KindNavS = SingleS.as(makeId(RK_UPDATE, 'IVK'), {
    placeholder: PLACEHOLDER_INFO_KIND,
    options    : SELECT_INFO_KIND,
});
export const InfoNavS = SingleS.as(makeId(RK_UPDATE, 'IVI'), {
    placeholder: PLACEHOLDER_INFO_EMBED,
});


const view = (s: St, ax: Ax) => E.gen(function * () {
    const selected = ax.selected.map((v) => v.value);

    const Kind = KindNavS.fromMap(s.cmap)
        .setDefaultValuesIf(ax.id.predicate, selected);

    let Info = InfoNavS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);

    if (Kind.id.predicate === ax.id.predicate) {
        const infos = pipe(
            yield * infoQueryByServer({pk: s.server_id}),
            filterL((i) => i.kind === Kind.values[0]),
            sortByL(
                ORD.mapInput(ORDN, (i) => i.selector_order ?? 100),
                ORD.mapInput(ORDS, (i) => i.selector_label ?? i.name ?? 'ope'),
                ORD.mapInput(ORD.Date, (i) => i.updated),
            ),
            mapL((i) => ({
                label      : i.selector_label ?? i.name!,
                description: i.selector_desc!,
                value      : [i.sk, i.embed_id!].join(DELIM_DATA),
            })),
        );

        Info = Info.render({
            options: infos.length
                ? infos
                : [{
                    label: UNAVAILABLE,
                    value: UNAVAILABLE,
                }],
        });
    }

    let viewer: Embed | undefined;

    if (Info.id.predicate === ax.id.predicate) {
        const [infoId, embedId] = Info.values[0].split(DELIM_DATA);

        const embed = yield * MenuCache.embedRead(embedId);

        viewer = asViewer(viewInfoEmbed(embed));
    }


    return {
        ...s,
        title      : LABEL_TITLE_INFO,
        description: unset,
        system     : unset,

        editor: unset,
        viewer: viewer ?? {
            description: 'Select Kind/Info',
        },
        status: unset,

        back: BackB.as(OmbiBoardB.id),

        sel1: Kind.render({disabled: false}),
        sel2: Info.render({
            disabled:
                !Kind.values.length
                || Info.component.options![0].value === UNAVAILABLE,
        }),

        submit:
            (!Kind.values.length && !Info.values.length)
                ? InfoViewerCreatorB.if(s.user_roles.includes(s.server!.admin as snflk))
                : InfoViewerAdminB.if(s.user_roles.includes(s.server!.admin as snflk))?.render({
                    disabled: !Info.values.length,
                }),
    } satisfies St;
});


export const infoViewerReducer = {
    [InfoViewerB.id.predicate]: view,
    [KindNavS.id.predicate]   : view,
    [InfoNavS.id.predicate]   : view,
};
