import {BackB, PrimaryB, SingleS} from '#src/discord/ixc/components/global-components.ts';
import {makeId, typeRx} from '#src/discord/ixc/store/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {E, pipe} from '#src/internal/pure/effect.ts';
import {asViewer, unset} from '#src/discord/ixc/components/component-utils.ts';
import {OmbiBoardB} from '#src/discord/ixc/view-reducers/omni-board.ts';
import {InfoViewerAdminB} from '#src/discord/ixc/view-reducers/info-viewer-admin.ts';
import type {snflk} from '#src/discord/types.ts';
import {InfoViewerCreatorB} from '#src/discord/ixc/view-reducers/info-viewer-creator.ts';
import {infoQueryByServer, infoRead} from '#src/dynamo/operations/info.ts';
import {filterL, mapL} from '#src/internal/pure/pure-list.ts';
import type {Embed} from 'dfx/types';
import {SELECT_INFO_KIND} from '#src/discord/ix-constants.ts';


export const InfoViewerB = PrimaryB.as(makeId(RDXK.OPEN, 'IV'), {
    label: 'Info',
});
export const KindNavS = SingleS.as(makeId(RDXK.UPDATE, 'IVK'), {
    placeholder: 'Select Kind',
    options    : SELECT_INFO_KIND,
});
export const InfoNavS = SingleS.as(makeId(RDXK.UPDATE, 'IVI'));


const view = typeRx((s, ax) => E.gen(function * () {
    const selected = ax.selected.map((v) => v.value);


    const Kind = KindNavS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);
    let Info = InfoNavS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);


    if (Kind.id.predicate === ax.id.predicate) {
        const infos = pipe(
            yield * infoQueryByServer({pk: s.server_id}),
            filterL((i) => i.kind === Kind.values[0]),
            mapL((i) => ({
                label: i.name,
                value: i.sk,
            })),
        );

        Info = Info.render({
            options: infos.length
                ? infos
                : [{
                    label: 'Unavailable',
                    value: 'Unavailable',
                }],
        });
    }

    let viewer: Embed | undefined;
    if (Info.id.predicate === ax.id.predicate) {
        const info = yield * infoRead({pk: s.server_id, sk: Info.values[0]});

        viewer = asViewer({
            color      : info.color,
            title      : info.name,
            description: info.desc,
            footer     : {
                text: 'last updated',
            },
            timestamp: info.updated.toISOString(),
        });
    }


    return {
        ...s,
        title      : 'Info',
        description: unset,

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
                || Info.values[0] === 'Unavailable',
        }),

        submit: InfoViewerCreatorB
            .if(s.user_roles.includes(s.server!.admin as snflk))
            ?.render({
                disabled:
                    !!Kind.values.length
                    || !!Info.values.length,
            }),

        delete: InfoViewerAdminB
            .if(s.user_roles.includes(s.server!.admin as snflk))
            ?.render({
                disabled:
                    !Kind.values.length
                    || !Info.values.length,
            }),
    };
}));


export const infoViewerReducer = {
    [InfoViewerB.id.predicate]: view,
    [KindNavS.id.predicate]   : view,
    [InfoNavS.id.predicate]   : view,
};
