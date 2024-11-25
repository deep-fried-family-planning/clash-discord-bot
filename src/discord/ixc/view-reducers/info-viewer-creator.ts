import {BackB, NewB, SingleS, SubmitB} from '#src/discord/ixc/components/global-components.ts';
import {makeId} from '#src/discord/ixc/store/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {E} from '#src/internal/pure/effect.ts';
import {asEditor, unset} from '#src/discord/ixc/components/component-utils.ts';
import {InfoViewerB} from '#src/discord/ixc/view-reducers/info-viewer.ts';
import {EmbedEditorB} from '#src/discord/ixc/view-reducers/editors/embed-editor.ts';
import type {Embed} from 'dfx/types';
import {dtNow, dtNowIso} from '#src/discord/util/markdown.ts';
import {infoCreate} from '#src/dynamo/operations/info.ts';
import {v4} from 'uuid';
import type {DInfo} from '#src/dynamo/schema/discord-info.ts';
import type {IxState} from '#src/discord/ixc/store/derive-state.ts';
import type {IxAction} from '#src/discord/ixc/store/derive-action.ts';
import {discordEmbedCreate} from '#src/dynamo/operations/embed.ts';
import type {num, str} from '#src/internal/pure/types-pure.ts';
import {SELECT_INFO_KIND, SELECT_POSITIONS} from '#src/discord/ix-constants.ts';
import {decodePersist, encodePersist, extractPersist} from '#src/discord/ixc/components/persistor.ts';


const createInfoEmbed = (s: IxState, kind: str, order: num, embed?: Embed) => E.gen(function * () {
    const embedId = v4();
    const infoId = v4();

    yield * discordEmbedCreate({
        type        : 'DiscordEmbed',
        pk          : embedId,
        sk          : 'now',
        gsi_embed_id: embedId,

        version: '1.0.0',
        created: dtNow(),
        updated: dtNow(),

        original_type     : 'DiscordInfo',
        original_pk       : s.server_id,
        original_sk       : infoId,
        original_server_id: s.server_id,
        original_user_id  : s.user_id,

        embed: embed!,
    });

    yield * infoCreate({
        type          : 'DiscordInfo',
        pk            : s.server_id,
        sk            : infoId,
        version       : '1.0.0',
        created       : dtNow(),
        updated       : dtNow(),
        kind          : kind as DInfo['kind'],
        embed_id      : embedId,
        selector_label: embed!.title!,
        selector_order: order,
    });
});


export const InfoViewerCreatorB = NewB.as(makeId(RDXK.OPEN, 'IVC'));
const Submit = SubmitB.as(makeId(RDXK.SUBMIT, 'IVC'));
const KindS = SingleS.as(makeId(RDXK.UPDATE, 'IVCK'), {
    placeholder: 'Info Kind',
    options    : SELECT_INFO_KIND,
});
const PositionS = SingleS.as(makeId(RDXK.UPDATE, 'ICVP'), {
    placeholder: 'Selector Position',
    options    : SELECT_POSITIONS,
});


const view = (s: IxState, ax: IxAction) => E.gen(function * () {
    const persisted = decodePersist(s.description);

    const Kind = KindS.fromMap(s.cmap).setDefaultValuesIf(KindS.id.predicate, extractPersist(persisted, ax, KindS));
    const Position = PositionS.fromMap(s.cmap).setDefaultValuesIf(PositionS.id.predicate, extractPersist(persisted, ax, PositionS));

    if (Submit.clicked(ax)) {
        yield * createInfoEmbed(s, Kind.values[0], parseInt(Position.values[0]), s.editor);
    }

    return {
        ...s,
        title      : 'New Info Page',
        description: encodePersist(
            Kind,
            Position,
        ),

        editor: asEditor({
            ...s.editor
            ?? {
                title      : 'New Info Embed',
                description: 'New Info Description',
            },
            footer: {
                text: 'last updated',
            },
            timestamp: dtNowIso(),
        }),
        viewer: unset,
        status: unset,

        sel1: Kind.render({
            disabled:
                Submit.clicked(ax),
        }),
        sel2: Position.render({
            disabled:
                Submit.clicked(ax),
        }),
        row3: [
            EmbedEditorB.fwd(InfoViewerCreatorB.id).render({
                disabled:
                    Submit.clicked(ax),
            }),
        ],

        submit:
            Submit.clicked(ax)
                ? Submit.as(InfoViewerCreatorB.id).render({
                    label: 'Create Another Info Page',
                })
                : Submit.render({
                    disabled:
                        !Kind.values.length
                        || !Position.values.length,
                }),

        back: BackB.as(InfoViewerB.id),
    };
});


export const infoViewerCreatorReducer = {
    [InfoViewerCreatorB.id.predicate]: view,
    [Submit.id.predicate]            : view,
    [KindS.id.predicate]             : view,
    [PositionS.id.predicate]         : view,
};
